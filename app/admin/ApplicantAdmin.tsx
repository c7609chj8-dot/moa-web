"use client";

import { useState } from "react";
import {
  applicationStatuses,
  attendanceStatuses,
  paymentStatuses,
  type ApplicationRecord,
} from "@/lib/application-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Summary = {
  today: number;
  remaining: number;
  week: number;
  month: number;
  pending: number;
};

function ApplicationRow({
  initial,
  onDelete,
}: {
  initial: ApplicationRecord;
  onDelete: (id: string) => void;
}) {
  const [item, setItem] = useState(initial),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    setMessage("저장 중…");
    const response = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      }),
      data = await response.json();
    setSaving(false);
    setMessage(response.ok ? "저장됨" : (data.error ?? "저장 실패"));
  }
  async function remove() {
    const response = await fetch(
      `/api/admin/applications?id=${encodeURIComponent(item.id)}`,
      { method: "DELETE" },
    );
    if (response.ok) onDelete(item.id);
    else setMessage("삭제하지 못했습니다.");
  }
  return (
    <TableRow>
      <TableCell>
        <b>{item.trainingDate}</b>
        <small>{new Date(item.createdAt).toLocaleString("ko-KR")}</small>
      </TableCell>
      <TableCell>
        <b>{item.name}</b>
        <small>{item.isForeigner ? "외국인" : "내국인"}</small>
      </TableCell>
      <TableCell>
        <a href={`tel:${item.phone}`}>{item.phone}</a>
        {item.birthDate && <small>{item.birthDate}</small>}
      </TableCell>
      <TableCell>
        <select
          aria-label={`${item.name} 예약 상태`}
          value={item.status}
          onChange={(event) =>
            setItem((current) => ({
              ...current,
              status: event.target.value as ApplicationRecord["status"],
            }))
          }
        >
          {applicationStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <select
          aria-label={`${item.name} 결제 상태`}
          value={item.paymentStatus}
          onChange={(event) =>
            setItem((current) => ({
              ...current,
              paymentStatus: event.target
                .value as ApplicationRecord["paymentStatus"],
            }))
          }
        >
          {paymentStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <select
          aria-label={`${item.name} 출석 상태`}
          value={item.attendanceStatus}
          onChange={(event) =>
            setItem((current) => ({
              ...current,
              attendanceStatus: event.target
                .value as ApplicationRecord["attendanceStatus"],
            }))
          }
        >
          {attendanceStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <textarea
          aria-label={`${item.name} 관리자 메모`}
          value={item.memo}
          placeholder={item.request || "관리자 메모"}
          onChange={(event) =>
            setItem((current) => ({ ...current, memo: event.target.value }))
          }
        />
      </TableCell>
      <TableCell>
        <div className="applicantActions">
          <button type="button" onClick={save} disabled={saving}>
            저장
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="dangerButton">
                삭제
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>신청자 정보를 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  {item.name}님의 예약 정보가 영구 삭제됩니다. 일반적인 예약 취소는
                  상태를 ‘취소’로 바꾸는 것을 권장합니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>돌아가기</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={remove}>
                  영구 삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <small className="rowMessage" role="status">
          {message}
        </small>
      </TableCell>
    </TableRow>
  );
}

export default function ApplicantAdmin({
  initial,
  summary,
}: {
  initial: ApplicationRecord[];
  summary: Summary;
}) {
  const [items, setItems] = useState(initial),
    [period, setPeriod] = useState("month"),
    [loading, setLoading] = useState(false);
  async function load(next: string) {
    setPeriod(next);
    setLoading(true);
    const response = await fetch(
        `/api/admin/applications?period=${encodeURIComponent(next)}`,
      ),
      data = await response.json();
    if (response.ok) setItems(data.applications);
    setLoading(false);
  }
  const cards = [
    ["오늘 교육생", `${summary.today}명`],
    ["오늘 남은 자리", `${summary.remaining}명`],
    ["이번 주 예약", `${summary.week}명`],
    ["이번 달 교육생", `${summary.month}명`],
    ["미확인 신청", `${summary.pending}건`],
  ];
  return (
    <section className="applicantAdmin">
      <h2>예약·신청자 관리</h2>
      <div className="dashboardCards">
        {cards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="applicantToolbar">
        <div>
          {[
            ["today", "오늘"],
            ["week", "이번 주"],
            ["month", "이번 달"],
            ["all", "전체"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={period === value ? "active" : ""}
              onClick={() => load(value)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>
        <span>{loading ? "불러오는 중…" : `${items.length}건`}</span>
      </div>
      <Table className="applicantTable">
        <TableHeader>
          <TableRow>
            <TableHead>교육일/신청</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead>예약</TableHead>
            <TableHead>결제</TableHead>
            <TableHead>출석</TableHead>
            <TableHead>메모</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((item) => (
              <ApplicationRow
                initial={item}
                onDelete={(id) =>
                  setItems((current) => current.filter((x) => x.id !== id))
                }
                key={item.id}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>표시할 신청자가 없습니다.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
