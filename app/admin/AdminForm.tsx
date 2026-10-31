"use client";
import { useState } from "react";
import type {
  SiteSettings,
  ResourceItem,
  LinkItem,
  PhotoItem,
  InstructorItem,
  FaqItem,
  HomepageContent,
} from "@/lib/site-settings";
import { Switch } from "@/components/ui/switch";
export default function AdminForm({ initial }: { initial: SiteSettings }) {
  const [f, setF] = useState<SiteSettings>(() => ({
      ...initial,
      photos: initial.photos.map((x) => ({
        ...x,
        id: x.id || crypto.randomUUID(),
      })),
      resources: initial.resources.map((x) => ({
        ...x,
        id: x.id || crypto.randomUUID(),
      })),
      instructors: initial.instructors.map((x) => ({
        ...x,
        id: x.id || crypto.randomUUID(),
      })),
      faqs: initial.faqs.map((x) => ({
        ...x,
        id: x.id || crypto.randomUUID(),
      })),
    })),
    [msg, setMsg] = useState(""),
    [uploads, setUploads] = useState<
      Record<string, "uploading" | "done" | "error">
    >({});
  const busy = Object.values(uploads).some((x) => x === "uploading");
  const basic = (k: keyof SiteSettings, l: string, m = false) => (
    <label className="adminField">
      <span>{l}</span>
      {m ? (
        <textarea
          value={String(f[k])}
          onChange={(e) => setF((v) => ({ ...v, [k]: e.target.value }))}
        />
      ) : (
        <input
          value={String(f[k])}
          onChange={(e) => setF((v) => ({ ...v, [k]: e.target.value }))}
        />
      )}
    </label>
  );
  const update = <T,>(
    key: "resources" | "relatedSites" | "photos" | "instructors" | "faqs",
    i: number,
    next: (old: T) => T,
  ) =>
    setF((v) => ({
      ...v,
      [key]: v[key].map((x, n) => (n === i ? next(x as T) : x)) as never,
    }));
  const remove = (
    key: "resources" | "relatedSites" | "photos" | "instructors" | "faqs",
    i: number,
  ) =>
    setF((v) => ({ ...v, [key]: v[key].filter((_, n) => n !== i) as never }));
  const homeField = (k: keyof HomepageContent, label: string, multiline = false) => (
    <label className="adminField">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={f.homepage[k]}
          onChange={(event) =>
            setF((current) => ({
              ...current,
              homepage: { ...current.homepage, [k]: event.target.value },
            }))
          }
        />
      ) : (
        <input
          value={f.homepage[k]}
          onChange={(event) =>
            setF((current) => ({
              ...current,
              homepage: { ...current.homepage, [k]: event.target.value },
            }))
          }
        />
      )}
    </label>
  );

  async function resizeForUpload(file: File): Promise<Blob> {
    if (file.type === "image/gif" || file.size < 1_500_000) return file;
    try {
      const image = await createImageBitmap(file),
        max = 1800,
        scale = Math.min(1, max / Math.max(image.width, image.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      return (
        (await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.84),
        )) ?? file
      );
    } catch {
      return file;
    }
  }

  async function upload(file: File, key: string, done: (url: string) => void) {
    setUploads((v) => ({ ...v, [key]: "uploading" }));
    setMsg(`${file.name} 업로드 중…`);
    try {
      const body = await resizeForUpload(file);
      const r = await fetch("/api/media", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "content-type": body.type || file.type,
            "x-file-name": encodeURIComponent(file.name),
          },
          body,
        }),
        d = await r.json();
      if (r.ok) {
        done(d.url);
        setUploads((v) => ({ ...v, [key]: "done" }));
        setMsg(
          "선택한 파일이 업로드되었습니다. 마지막에 저장 버튼을 눌러주세요.",
        );
      } else {
        setUploads((v) => ({ ...v, [key]: "error" }));
        setMsg(d.error ?? "업로드하지 못했습니다.");
      }
    } catch {
      setUploads((v) => ({ ...v, [key]: "error" }));
      setMsg("업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMsg("저장 중…");
    const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(f),
      }),
      d = await r.json();
    setMsg(
      r.ok
        ? "저장되었습니다. 홈페이지에 즉시 반영됩니다."
        : (d.error ?? "저장하지 못했습니다."),
    );
  }
  return (
    <form className="adminForm" onSubmit={save}>
      <h2>기본 정보</h2>
      <div className="adminGrid">
        {basic("fee", "교육비")}
        {basic("phone", "전화번호")}
        {basic("fax", "팩스번호")}
        {basic("weekdaySchedule", "평일 교육 일정")}
        {basic("saturdaySchedule", "토요일 교육 일정")}
        {basic("address", "주소")}
      </div>
      <h2>메인 화면 문구</h2>
      <p className="adminHint">
        첫 화면과 센터 소개, 하단 상담 영역의 문구를 직접 수정할 수 있습니다.
        메인 설명에서 <b>{"{fee}"}</b>를 입력하면 현재 교육비로 자동 표시됩니다.
      </p>
      <div className="adminGrid">
        {homeField("heroEyebrow", "메인 상단 안내")}
        {homeField("heroTitleLine1", "메인 제목 첫째 줄")}
        {homeField("heroTitleLine2", "메인 제목 둘째 줄")}
        {homeField("contactTitle", "하단 상담 제목")}
      </div>
      {homeField("heroDescription", "메인 상세 안내", true)}
      <div className="adminGrid adminGridTop">
        {homeField("aboutTitleLine1", "센터 소개 제목 첫째 줄")}
        {homeField("aboutTitleLine2", "센터 소개 제목 둘째 줄")}
        {homeField("aboutText1", "센터 소개 내용 1", true)}
        {homeField("aboutText2", "센터 소개 내용 2", true)}
      </div>
      {homeField("contactText", "하단 상담 설명", true)}

      <h2>공지 및 팝업</h2>
      <div className="adminToggle">
        <div>
          <b>메인 교육 안내 노출</b>
          <span>끄면 홈페이지의 교육 안내 카드 영역이 숨겨집니다.</span>
        </div>
        <Switch
          aria-label="메인 교육 안내 노출"
          checked={f.noticeEnabled}
          onCheckedChange={(checked) =>
            setF((current) => ({ ...current, noticeEnabled: checked }))
          }
        />
      </div>
      <div className="adminGrid adminGridTop">
        {basic("noticeTitle", "공지 제목")}
        {basic("noticeText", "공지 내용", true)}
      </div>
      <div className="adminToggle">
        <div>
          <b>팝업 공지 사용</b>
          <span>방문자에게 팝업을 표시하며 ‘오늘 하루 보지 않기’를 제공합니다.</span>
        </div>
        <Switch
          aria-label="팝업 공지 사용"
          checked={f.popup.enabled}
          onCheckedChange={(checked) =>
            setF((current) => ({
              ...current,
              popup: { ...current.popup, enabled: checked },
            }))
          }
        />
      </div>
      <div className="adminGrid adminGridTop">
        <label className="adminField">
          <span>팝업 제목</span>
          <input
            value={f.popup.title}
            onChange={(event) =>
              setF((current) => ({
                ...current,
                popup: { ...current.popup, title: event.target.value },
              }))
            }
          />
        </label>
        <label className="adminField">
          <span>팝업 내용</span>
          <textarea
            value={f.popup.text}
            onChange={(event) =>
              setF((current) => ({
                ...current,
                popup: { ...current.popup, text: event.target.value },
              }))
            }
          />
        </label>
      </div>

      <h2>자주 묻는 질문</h2>
      <div className="adminToggle">
        <div>
          <b>FAQ 노출</b>
          <span>질문과 답변의 순서는 아래 목록 순서대로 표시됩니다.</span>
        </div>
        <Switch
          aria-label="FAQ 노출"
          checked={f.faqEnabled}
          onCheckedChange={(checked) =>
            setF((current) => ({ ...current, faqEnabled: checked }))
          }
        />
      </div>
      {f.faqs.map((item, i) => (
        <div className="faqAdmin" key={item.id}>
          <input
            aria-label={`${i + 1}번 FAQ 질문`}
            placeholder="질문"
            value={item.question}
            onChange={(event) =>
              update<FaqItem>("faqs", i, (old) => ({
                ...old,
                question: event.target.value,
              }))
            }
          />
          <textarea
            aria-label={`${i + 1}번 FAQ 답변`}
            placeholder="답변"
            value={item.answer}
            onChange={(event) =>
              update<FaqItem>("faqs", i, (old) => ({
                ...old,
                answer: event.target.value,
              }))
            }
          />
          <button type="button" onClick={() => remove("faqs", i)}>
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        className="addBtn"
        onClick={() =>
          setF((current) => ({
            ...current,
            faqs: [
              ...current.faqs,
              { id: crypto.randomUUID(), question: "새 질문", answer: "" },
            ],
          }))
        }
      >
        + FAQ 추가
      </button>
      <h2>강사소개</h2>
      <p className="adminHint">강사별 사진과 소개 내용을 입력하세요.</p>
      {f.instructors.map((x, i) => {
        const key = `instructor-${x.id}`;
        return (
          <div className="instructorAdmin" key={x.id}>
            {x.photo && <img src={x.photo} alt="강사 미리보기" />}
            <input
              placeholder="강사 이름"
              value={x.name}
              onChange={(e) =>
                update<InstructorItem>("instructors", i, (o) => ({
                  ...o,
                  name: e.target.value,
                }))
              }
            />
            <input
              placeholder="직책·역할"
              value={x.role}
              onChange={(e) =>
                update<InstructorItem>("instructors", i, (o) => ({
                  ...o,
                  role: e.target.value,
                }))
              }
            />
            <input
              placeholder="전문분야"
              value={x.specialty}
              onChange={(e) =>
                update<InstructorItem>("instructors", i, (o) => ({
                  ...o,
                  specialty: e.target.value,
                }))
              }
            />
            <textarea
              placeholder="주요 경력과 소개"
              value={x.bio}
              onChange={(e) =>
                update<InstructorItem>("instructors", i, (o) => ({
                  ...o,
                  bio: e.target.value,
                }))
              }
            />
            <label className="uploadBtn">
              {uploads[key] === "uploading"
                ? "이 강사 사진만 업로드 중…"
                : uploads[key] === "done"
                  ? "이 강사 사진 변경 완료 ✓"
                  : "이 강사 사진 변경"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploads[key] === "uploading"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    upload(file, key, (url) =>
                      update<InstructorItem>("instructors", i, (o) => ({
                        ...o,
                        photo: url,
                      })),
                    );
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => remove("instructors", i)}
            >
              강사 삭제
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="addBtn"
        disabled={busy}
        onClick={() =>
          setF((v) => ({
            ...v,
            instructors: [
              ...v.instructors,
              {
                id: crypto.randomUUID(),
                name: "새 강사",
                role: "",
                specialty: "",
                bio: "",
                photo: "",
              },
            ],
          }))
        }
      >
        + 강사 추가
      </button>
      <h2>교육사진</h2>
      <p className="adminHint">
        각 사진은 독립적으로 변경됩니다. 사진을 선택한 뒤 마지막에 저장하세요.
      </p>
      {f.photos.map((x, i) => {
        const key = `photo-${x.id}`;
        return (
          <div className="photoAdmin" key={x.id}>
            {x.url && <img src={x.url} alt="미리보기" />}
            <input
              value={x.title}
              onChange={(e) =>
                update<PhotoItem>("photos", i, (o) => ({
                  ...o,
                  title: e.target.value,
                }))
              }
            />
            <label className="uploadBtn">
              {uploads[key] === "uploading"
                ? "이 사진만 업로드 중…"
                : uploads[key] === "done"
                  ? "이 사진 변경 완료 ✓"
                  : "이 사진 변경"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploads[key] === "uploading"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    upload(file, key, (url) =>
                      update<PhotoItem>("photos", i, (o) => ({ ...o, url })),
                    );
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => remove("photos", i)}
            >
              삭제
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="addBtn"
        disabled={busy}
        onClick={() =>
          setF((v) => ({
            ...v,
            photos: [
              ...v.photos,
              { id: crypto.randomUUID(), title: "새 교육사진", url: "" },
            ],
          }))
        }
      >
        + 사진 추가
      </button>
      <h2>자료실</h2>
      {f.resources.map((x, i) => {
        const key = `resource-${x.id}`;
        return (
          <div className="repeatBox" key={x.id}>
            {x.image && (
              <img className="thumbPreview" src={x.image} alt="자료 미리보기" />
            )}
            <input
              placeholder="자료 제목"
              value={x.title}
              onChange={(e) =>
                update<ResourceItem>("resources", i, (o) => ({
                  ...o,
                  title: e.target.value,
                }))
              }
            />
            <input
              placeholder="자료 설명"
              value={x.description}
              onChange={(e) =>
                update<ResourceItem>("resources", i, (o) => ({
                  ...o,
                  description: e.target.value,
                }))
              }
            />
            <input
              placeholder="자료 연결 주소 https://..."
              value={x.url}
              onChange={(e) =>
                update<ResourceItem>("resources", i, (o) => ({
                  ...o,
                  url: e.target.value,
                }))
              }
            />
            <label className="uploadBtn">
              {uploads[`${key}-file`] === "uploading"
                ? "자료 파일 업로드 중…"
                : uploads[`${key}-file`] === "done"
                  ? "자료 파일 업로드 완료 ✓"
                  : "PDF·한글·Word 파일 업로드"}
              <input
                type="file"
                accept=".pdf,.hwp,.hwpx,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={uploads[`${key}-file`] === "uploading"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    upload(file, `${key}-file`, (url) =>
                      update<ResourceItem>("resources", i, (o) => ({
                        ...o,
                        url,
                      })),
                    );
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <label className="uploadBtn">
              {uploads[key] === "uploading"
                ? "이 썸네일만 업로드 중…"
                : uploads[key] === "done"
                  ? "이 썸네일 변경 완료 ✓"
                  : "썸네일 사진 변경"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploads[key] === "uploading"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    upload(file, key, (url) =>
                      update<ResourceItem>("resources", i, (o) => ({
                        ...o,
                        image: url,
                      })),
                    );
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => remove("resources", i)}
            >
              자료 삭제
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="addBtn"
        disabled={busy}
        onClick={() =>
          setF((v) => ({
            ...v,
            resources: [
              ...v.resources,
              {
                id: crypto.randomUUID(),
                title: "새 자료",
                description: "",
                url: "",
                image: "",
              },
            ],
          }))
        }
      >
        + 자료 추가
      </button>
      <h2>관련사이트</h2>
      {f.relatedSites.map((x, i) => (
        <div className="repeatRow" key={i}>
          <input
            placeholder="사이트 이름"
            value={x.title}
            onChange={(e) =>
              update<LinkItem>("relatedSites", i, (o) => ({
                ...o,
                title: e.target.value,
              }))
            }
          />
          <input
            placeholder="사이트 주소 https://..."
            value={x.url}
            onChange={(e) =>
              update<LinkItem>("relatedSites", i, (o) => ({
                ...o,
                url: e.target.value,
              }))
            }
          />
          <button type="button" onClick={() => remove("relatedSites", i)}>
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        className="addBtn"
        onClick={() =>
          setF((v) => ({
            ...v,
            relatedSites: [
              ...v.relatedSites,
              { title: "새 관련사이트", url: "" },
            ],
          }))
        }
      >
        + 사이트 추가
      </button>
      <div className="saveBar">
        <button type="submit" disabled={busy}>
          {busy ? "사진 업로드 완료를 기다려 주세요" : "모든 변경사항 저장"}
        </button>
        <p role="status">{msg}</p>
      </div>
    </form>
  );
}
