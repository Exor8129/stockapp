"use client";

import { Card } from "antd";
import { Database, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigation = (team) => {
    router.push(`/team?user=${team}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Card */}
        <Card
          className="w-64 p-4 text-center cursor-pointer hover:shadow-lg"
          onClick={() => handleNavigation("teamblue")}
        >
          <Users size={40} className="mx-auto text-blue-500" />
          <h2 className="text-xl font-semibold mt-4">Team Blue</h2>
        </Card>

        {/* Team 2 Card */}
        <Card
          className="w-64 p-4 text-center cursor-pointer hover:shadow-lg"
          onClick={() => handleNavigation("teamred")}
        >
          <Users size={40} className="mx-auto text-red-500" />
          <h2 className="text-xl font-semibold mt-4">Team Red</h2>
        </Card>

        {/* Data Card */}
        <Card
          className="w-64 p-4 text-center cursor-pointer hover:shadow-lg"
          onClick={() => router.push(`/data`)}
        >
          <Database size={40} className="mx-auto text-green-500" />
          <h2 className="text-xl font-semibold mt-4">Database</h2>
        </Card>
      </div>
    </div>
  );
}
