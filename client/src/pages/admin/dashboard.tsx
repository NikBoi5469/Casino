import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  History,
  Settings,
  Home,
  AlertTriangle,
  Ban,
  UserCheck,
  Lock
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: gameSettings } = useQuery({
    queryKey: ["/api/admin/game-settings"],
  });

  const { data: recentBets } = useQuery({
    queryKey: ["/api/admin/recent-bets"],
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalBets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(analytics?.totalVolume).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.activeUsers?.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bets Table (from original code) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBets?.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{bet.userId}</TableCell>
                    <TableCell className="capitalize">{bet.game}</TableCell>
                    <TableCell>${Number(bet.amount).toFixed(2)}</TableCell>
                    <TableCell>{Number(bet.multiplier).toFixed(2)}x</TableCell>
                    <TableCell>${Number(bet.payout).toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(bet.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Game Settings</CardTitle>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Slots Settings */}
              <div>
                <h3 className="font-semibold mb-2">Slots</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">RTP Rate (%)</label>
                    <Input type="number" defaultValue={96} />
                  </div>
                  <div>
                    <label className="text-sm">Max Payout</label>
                    <Input type="number" defaultValue={10000} />
                  </div>
                </div>
              </div>

              {/* Crash Settings */}
              <div>
                <h3 className="font-semibold mb-2">Crash</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">House Edge (%)</label>
                    <Input type="number" defaultValue={3.5} />
                  </div>
                  <div>
                    <label className="text-sm">Max Multiplier</label>
                    <Input type="number" defaultValue={1000} />
                  </div>
                </div>
              </div>

              {/* Dice Settings */}
              <div>
                <h3 className="font-semibold mb-2">Dice</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">House Edge (%)</label>
                    <Input type="number" defaultValue={1} />
                  </div>
                  <div>
                    <label className="text-sm">Max Bet</label>
                    <Input type="number" defaultValue={1000} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>${Number(user.balance).toFixed(2)}</TableCell>
                    <TableCell>${Number(user.totalProfit).toFixed(2)}</TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <span className="text-red-500">Banned</span>
                      ) : (
                        <span className="text-green-500">Active</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Ban className="w-4 h-4 mr-1" />
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Lock className="w-4 h-4 mr-1" />
                          Reset Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.riskAnalysis?.map((risk, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className={`w-4 h-4 mr-2 ${
                          risk.level === 'high' ? 'text-red-500' :
                          risk.level === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        {risk.level}
                      </div>
                    </TableCell>
                    <TableCell>{risk.description}</TableCell>
                    <TableCell>{risk.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}