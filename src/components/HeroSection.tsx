import { Button } from "@/components/ui/button";
import { Users, ArrowRight, BookOpen, Code, Lightbulb, MapPin, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

const StudyScene3D = lazy(() => import("@/components/StudyScene3D").then(m => ({ default: m.StudyScene3D })));

interface HeroSectionProps {
  onGetStarted: () => void;
  onBrowse: () => void;
  isAuthenticated: boolean;
}

export const HeroSection = ({
  onGetStarted,
  onBrowse,
  isAuthenticated
}: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">

      {/* 3D Study Scene */}
      <Suspense fallback={null}>
        <StudyScene3D />
      </Suspense>

      {/* Animated gradient blobs */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full dark:opacity-20 opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #6d28d9, #4f46e5)" }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full dark:opacity-15 opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, #2563eb, #7c3aed)" }}
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-[-5%] left-[30%] w-[350px] h-[350px] rounded-full dark:opacity-10 opacity-[0.07] blur-[100px]"
          style={{ background: "radial-gradient(circle, #8b5cf6, #3b82f6)" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="container relative z-10 py-16 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-border bg-muted/50 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-sm font-medium text-muted-foreground">
              București • 15+ Universități
            </span>
            <MapPin className="w-3.5 h-3.5 text-violet-500" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1]"
          >
            Găsește-ți{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #6366f1, #3b82f6)" }}
            >
              Colegii
            </span>
            <br />
            de Studiu{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
            >
              Potriviți
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Conectează-te cu studenți din universitățile din București pentru proiecte,
            grupuri de studiu și colaborări academice.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 px-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold rounded-xl w-full sm:w-auto text-white border-0"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 24px rgba(139, 92, 246, 0.35)",
                }}
                onClick={() => { triggerHaptic('medium'); onGetStarted(); }}
              >
                <Users className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Creează Profil" : "Începe Gratuit"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold rounded-xl w-full sm:w-auto"
                onClick={() => { triggerHaptic('light'); onBrowse(); }}
              >
                Explorează Studenți
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <BookOpen className="w-5 h-5 text-white" />,
                gradient: "linear-gradient(135deg, #7c3aed, #6366f1)",
                glow: "rgba(109, 40, 217, 0.25)",
                title: "Grupuri de Studiu",
                desc: "Găsește colegi care studiază aceleași materii",
                delay: 0.5,
              },
              {
                icon: <Code className="w-5 h-5 text-white" />,
                gradient: "linear-gradient(135deg, #2563eb, #7c3aed)",
                glow: "rgba(37, 99, 235, 0.25)",
                title: "Echipe de Proiect",
                desc: "Formează echipe cu competențe complementare",
                delay: 0.6,
              },
              {
                icon: <Lightbulb className="w-5 h-5 text-white" />,
                gradient: "linear-gradient(135deg, #6366f1, #2563eb)",
                glow: "rgba(99, 102, 241, 0.25)",
                title: "Mentorat",
                desc: "Conectează-te cu studenți din anii mai mari",
                delay: 0.7,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl p-5 text-center bg-card border border-border hover:border-violet-500/30 transition-colors duration-300 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 mx-auto transition-transform duration-300 group-hover:scale-110"
                  style={{ background: card.gradient, boxShadow: `0 4px 20px ${card.glow}` }}
                >
                  {card.icon}
                </div>
                <h3 className="font-display font-bold text-base mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Universities */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <p className="text-sm text-muted-foreground/60 mb-4">Universități partenere</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["UPB", "ASE", "UB", "UMFCD", "SNSPA", "UAUIM", "UTCB", "USAMV"].map((uni, i) => (
                <motion.span
                  key={uni}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default bg-muted/50 border border-border/50"
                >
                  {uni}
                </motion.span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
