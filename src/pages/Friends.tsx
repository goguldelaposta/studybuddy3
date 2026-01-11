import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useFriendships } from "@/hooks/useFriendships";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Clock, UserCheck, MessageCircle, UserMinus, Loader2 } from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Friends = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentUserProfile } = useProfiles();
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend
  } = useFriendships();

  if (!user) {
    navigate("/auth");
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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="gradient-text">Prietenii Mei</span>
          </h1>
          <p className="text-muted-foreground">
            Gestionează conexiunile tale cu alți studenți
          </p>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Prieteni
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1">{friends.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Cereri
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Trimise
              {sentRequests.length > 0 && (
                <Badge variant="outline" className="ml-1">{sentRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Friends Tab */}
              <TabsContent value="friends">
                {friends.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h3 className="font-display font-semibold text-lg mb-2">Nu ai prieteni încă</h3>
                      <p className="text-muted-foreground text-center max-w-sm">
                        Explorează profilurile studenților și trimite cereri de prietenie pentru a te conecta.
                      </p>
                      <Button 
                        className="mt-4 gradient-primary"
                        onClick={() => navigate("/")}
                      >
                        Explorează studenți
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {friends.map((friend) => (
                      <Card key={friend.id} className="hover-lift">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={friend.avatar_url || undefined} />
                              <AvatarFallback className="gradient-primary text-primary-foreground">
                                {getInitials(friend.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{friend.full_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{friend.faculty}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigate(`/messages?with=${friend.user_id}`)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Mesaj
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeFriend(friend.user_id)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Requests Tab */}
              <TabsContent value="pending">
                {pendingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <UserPlus className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h3 className="font-display font-semibold text-lg mb-2">Nicio cerere în așteptare</h3>
                      <p className="text-muted-foreground text-center">
                        Vei primi notificări când cineva îți trimite o cerere de prietenie.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="hover-lift border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.profile.avatar_url || undefined} />
                              <AvatarFallback className="gradient-primary text-primary-foreground">
                                {getInitials(request.profile.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{request.profile.full_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{request.profile.faculty}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              className="flex-1 gradient-primary text-primary-foreground"
                              onClick={() => acceptFriendRequest(request.id)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Acceptă
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectFriendRequest(request.id)}
                            >
                              Respinge
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Sent Requests Tab */}
              <TabsContent value="sent">
                {sentRequests.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h3 className="font-display font-semibold text-lg mb-2">Nicio cerere trimisă</h3>
                      <p className="text-muted-foreground text-center">
                        Cererile de prietenie pe care le trimiți vor apărea aici.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sentRequests.map((request) => (
                      <Card key={request.id} className="hover-lift">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.profile.avatar_url || undefined} />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {getInitials(request.profile.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{request.profile.full_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{request.profile.faculty}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                În așteptare
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => cancelFriendRequest(request.id)}
                          >
                            Anulează cererea
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
