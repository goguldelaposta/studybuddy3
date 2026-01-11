import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { CreateAnnouncementDialog } from "@/components/CreateAnnouncementDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useAnnouncements, AnnouncementCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/hooks/useAnnouncements";
import { useMessages } from "@/hooks/useMessages";
import { Search, Megaphone, Loader2 } from "lucide-react";

const Announcements = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentUserProfile } = useProfiles();
  const {
    announcements,
    myAnnouncements,
    loading,
    createAnnouncement,
    toggleAnnouncementStatus,
    deleteAnnouncement,
    fetchAnnouncements,
  } = useAnnouncements();
  const { startConversation } = useMessages();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | "all">("all");

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  // Filter by category when changed
  useEffect(() => {
    if (selectedCategory === "all") {
      fetchAnnouncements();
    } else {
      fetchAnnouncements(selectedCategory);
    }
  }, [selectedCategory, fetchAnnouncements]);

  const handleContact = async (userId: string) => {
    const conversationId = await startConversation(userId);
    if (conversationId) {
      navigate(`/messages?with=${userId}`);
    }
  };

  // Filter announcements based on search
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyAnnouncements = myAnnouncements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: (AnnouncementCategory | "all")[] = [
    "all",
    "tutoring",
    "books",
    "roommate",
    "events",
    "jobs",
    "other",
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              <span className="gradient-text">Anunțuri</span>
            </h1>
            <p className="text-muted-foreground">
              Meditații, cărți, colegi de cameră și multe altele
            </p>
          </div>
          <CreateAnnouncementDialog onCreateAnnouncement={createAnnouncement} />
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută anunțuri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === cat ? "gradient-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? (
                  "Toate"
                ) : (
                  <span className="flex items-center gap-1">
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {CATEGORY_LABELS[cat]}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Toate Anunțurile
            </TabsTrigger>
            <TabsTrigger value="my" className="gap-2">
              Anunțurile Mele
              {myAnnouncements.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {myAnnouncements.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Niciun anunț găsit</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "all"
                    ? "Încearcă o altă căutare sau categorie"
                    : "Fii primul care publică un anunț!"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMyAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nu ai niciun anunț</h3>
                <p className="text-muted-foreground">
                  Publică primul tău anunț pentru a-l vedea aici.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    isOwner
                    onToggleStatus={toggleAnnouncementStatus}
                    onDelete={deleteAnnouncement}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Announcements;
