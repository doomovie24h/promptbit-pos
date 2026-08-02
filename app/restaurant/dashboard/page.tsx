import { ChefHat, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RestaurantDashboardPage() {
  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              แดชบอร์ดร้านอาหาร
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              ภาพรวมยอดขาย ออเดอร์ และการจัดการร้านอาหารของคุณ
            </p>
          </div>
        </div>

        {/* Stats Cards Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 rounded-3xl border border-border shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ยอดขายวันนี้</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">฿0.00</h3>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border border-border shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ออเดอร์รอทำ</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">0</h3>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <ShoppingBag size={20} />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border border-border shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ลูกค้าวันนี้</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">0</h3>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Users size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-3xl border border-border shadow-xs min-h-[300px] flex items-center justify-center text-muted-foreground">
            พื้นที่สำหรับแสดงกราฟยอดขาย
          </Card>
          <Card className="p-6 rounded-3xl border border-border shadow-xs min-h-[300px] flex items-center justify-center text-muted-foreground">
            พื้นที่สำหรับแสดงออเดอร์ล่าสุด
          </Card>
        </div>

      </div>
    </div>
  );
}