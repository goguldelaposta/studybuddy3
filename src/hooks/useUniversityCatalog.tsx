import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface University {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  city: string;
  logo_url: string | null;
}

export interface Faculty {
  id: string;
  university_id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Course {
  id: string;
  faculty_id: string;
  name: string;
  year: number;
  semester: number | null;
  description: string | null;
}

export interface FacultyWithUniversity extends Faculty {
  university: University;
}

export const useUniversityCatalog = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUniversities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .not('slug', 'is', null)
      .order('name');

    if (!error && data) {
      setUniversities(data as University[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  return { universities, loading, refetch: fetchUniversities };
};

export const useUniversityBySlug = (slug: string | undefined) => {
  const [university, setUniversity] = useState<University | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch university
      const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (uniError || !uniData) {
        setLoading(false);
        return;
      }

      setUniversity(uniData as University);

      // Fetch faculties
      const { data: facultiesData } = await supabase
        .from('faculties')
        .select('*')
        .eq('university_id', uniData.id)
        .order('name');

      if (facultiesData) {
        setFaculties(facultiesData as Faculty[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  return { university, faculties, loading };
};

export const useFacultyBySlug = (uniSlug: string | undefined, facultySlug: string | undefined) => {
  const [faculty, setFaculty] = useState<FacultyWithUniversity | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!uniSlug || !facultySlug) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch university first
      const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .select('*')
        .eq('slug', uniSlug)
        .single();

      if (uniError || !uniData) {
        setLoading(false);
        return;
      }

      // Fetch faculty
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculties')
        .select('*')
        .eq('university_id', uniData.id)
        .eq('slug', facultySlug)
        .single();

      if (facultyError || !facultyData) {
        setLoading(false);
        return;
      }

      setFaculty({
        ...(facultyData as Faculty),
        university: uniData as University
      });

      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('faculty_id', facultyData.id)
        .order('year')
        .order('semester');

      if (coursesData) {
        setCourses(coursesData as Course[]);
      }

      // Count notes for this faculty
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .ilike('faculty', `%${facultyData.name}%`);

      setNotesCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [uniSlug, facultySlug]);

  return { faculty, courses, notesCount, loading };
};
