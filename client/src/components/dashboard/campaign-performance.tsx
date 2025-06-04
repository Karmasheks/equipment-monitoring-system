import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface Campaign {
  id: number;
  name: string;
  progress: number;
}

export function CampaignPerformance() {
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const getCampaignColorClass = (progress: number) => {
    if (progress >= 85) return "bg-success-500 dark:bg-success-600";
    if (progress >= 60) return "bg-primary-500 dark:bg-primary-600";
    return "bg-warning-500 dark:bg-warning-600";
  };

  return (
    <Card>
      <CardHeader className="p-5 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="font-semibold text-gray-800 dark:text-white">Эффективность кампаний</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {campaigns ? (
            campaigns.map((campaign) => (
              <div key={campaign.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{campaign.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className={`${getCampaignColorClass(campaign.progress)} h-2 rounded-full`}
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 dark:bg-gray-700"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"></div>
                </div>
              ))
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="w-full py-2">
            Просмотреть все кампании
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
