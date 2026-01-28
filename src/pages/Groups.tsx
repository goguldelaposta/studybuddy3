import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { GroupCard } from "@/components/GroupCard";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useGroups } from "@/hooks/useGroups";
import { Search, Users, Loader2 } from "lucide-react";

const Groups = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentUserProfile } = useProfiles();
  const { groups, myGroups, loading, createGroup, joinGroup, leaveGroup, deleteGroup } = useGroups();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  const handleJoinGroup = async (groupId: string) => {
    setActionLoading(true);
    await joinGroup(groupId);
    setActionLoading(false);
  };

  const handleLeaveGroup = async (groupId: string) => {
    setActionLoading(true);
    await leaveGroup(groupId);
    setActionLoading(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    setActionLoading(true);
    await deleteGroup(groupId);
    setActionLoading(false);
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.university?.short_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyGroups = myGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      {/* Spacer for fixed navbar */}
      <div className="h-14" style={{ marginTop: 'env(safe-area-inset-top)' }} />
      
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
              <span className="gradient-text">Grupuri de Studiu</span>
            </h1>
            <p className="text-muted-foreground">
              Colaborează cu alți studenți în grupuri de studiu
            </p>
          </div>
          <CreateGroupDialog onCreateGroup={createGroup} />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută grupuri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              Toate Grupurile
            </TabsTrigger>
            <TabsTrigger value="my" className="gap-2">
              Grupurile Mele
              {myGroups.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {myGroups.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Niciun grup găsit</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Încearcă o altă căutare"
                    : "Fii primul care creează un grup de studiu!"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    onDelete={handleDeleteGroup}
                    loading={actionLoading}
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
            ) : filteredMyGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nu ești în niciun grup</h3>
                <p className="text-muted-foreground">
                  Alătură-te unui grup existent sau creează unul nou.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    onDelete={handleDeleteGroup}
                    loading={actionLoading}
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

export default Groups;
