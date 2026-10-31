export const applicationStatuses = ["확인대기", "예약확정", "취소"] as const;
export const paymentStatuses = ["미결제", "결제완료", "현장결제"] as const;
export const attendanceStatuses = ["미처리", "출석", "결석"] as const;

export type ApplicationRecord = {
  id: string;
  trainingDate: string;
  name: string;
  phone: string;
  birthDate: string;
  isForeigner: boolean;
  request: string;
  status: (typeof applicationStatuses)[number];
  paymentStatus: (typeof paymentStatuses)[number];
  attendanceStatus: (typeof attendanceStatuses)[number];
  memo: string;
  createdAt: string;
  updatedAt: string;
};
