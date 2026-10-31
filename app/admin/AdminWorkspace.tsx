"use client";

import type { ReactNode } from "react";
import { CalendarDays, ClipboardList, PanelsTopLeft } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminWorkspace({
  applicants,
  schedule,
  content,
}: {
  applicants: ReactNode;
  schedule: ReactNode;
  content: ReactNode;
}) {
  return (
    <Tabs defaultValue="applicants" className="adminWorkspace">
      <TabsList className="adminTabs" aria-label="관리 메뉴">
        <TabsTrigger value="applicants">
          <ClipboardList aria-hidden="true" /> 예약·신청자
        </TabsTrigger>
        <TabsTrigger value="schedule">
          <CalendarDays aria-hidden="true" /> 교육일정
        </TabsTrigger>
        <TabsTrigger value="content">
          <PanelsTopLeft aria-hidden="true" /> 홈페이지 편집
        </TabsTrigger>
      </TabsList>
      <TabsContent value="applicants">{applicants}</TabsContent>
      <TabsContent value="schedule">{schedule}</TabsContent>
      <TabsContent value="content">{content}</TabsContent>
    </Tabs>
  );
}
