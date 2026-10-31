import { readSettings } from "@/lib/site-settings";
import FaqSection from "./FaqSection";
import MobileActions from "./MobileActions";
import ShareButton from "./ShareButton";
import PopupNotice from "./PopupNotice";
import { SMS_RECIPIENT } from "@/lib/contact";
export const dynamic = "force-dynamic";
export default async function Home() {
  const s = await readSettings(),
    tel = s.phone.replace(/\D/g, ""),
    smsText = encodeURIComponent(
      "안녕하세요. 건설업 기초안전보건교육 문의드립니다.",
    ),
    naverMap = `https://map.naver.com/p/search/${encodeURIComponent(s.address)}`,
    kakaoMap = `https://map.kakao.com/link/search/${encodeURIComponent(s.address)}`,
    schedule = [
      ["평일 교육", s.weekdaySchedule],
      ["토요일 예약제", s.saturdaySchedule],
      ["교육 당일", "교육 시작 20분 전 입실"],
    ];
  return (
    <main>
      <PopupNotice popup={s.popup} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "한국안전교육",
            url: "https://korea-safety-education.c7609chj8.chatgpt.site",
            telephone: s.phone,
            faxNumber: s.fax,
            address: {
              "@type": "PostalAddress",
              streetAddress: s.address,
              addressRegion: "경상남도",
              addressCountry: "KR",
            },
            areaServed: ["양산", "부산", "경남"],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <header>
        <a className="brand" href="#top">
          <img src="/korea-safety-symbol.png" alt="한국안전교육 심볼" />
          <span>
            <b>한국안전교육</b>
            <small>KOREA SAFETY EDUCATION</small>
          </span>
        </a>
        <nav>
          <a href="#about">소개</a>
          <a href="#instructors">강사소개</a>
          <a href="/schedule">교육일정</a>
          <a href="#facility">교육사진</a>
          <a href="#resources">자료실</a>
          <a href="#links">관련사이트</a>
          <a href="#location">오시는 길</a>
        </nav>
        <a className="pill" href="#contact">
          상담 신청
        </a>
      </header>
      <section id="top" className="hero">
        <div className="shade" />
        <div className="heroText">
          <em>{s.homepage.heroEyebrow}</em>
          <h1>
            {s.homepage.heroTitleLine1}
            <br />
            {s.homepage.heroTitleLine2}
          </h1>
          <p className="heroDescription">
            {s.homepage.heroDescription.replaceAll("{fee}", s.fee)}
          </p>
          <div>
            <a className="button lime" href="/schedule">
              교육 일정 확인
            </a>
            <a className="button line" href="/schedule#calendar">
              교육 신청
            </a>
            <a className="button line" href={`tel:${tel}`}>
              전화 문의
            </a>
            <a className="button line" href={naverMap} target="_blank" rel="noreferrer">
              길찾기
            </a>
          </div>
        </div>
        <aside>
          <b>교육 핵심 안내</b>
          <dl>
            <div>
              <dt>평일 교육</dt>
              <dd>13:00–17:00</dd>
            </div>
            <div>
              <dt>교육비</dt>
              <dd>{s.fee}</dd>
            </div>
            <div>
              <dt>준비물</dt>
              <dd>신분증</dd>
            </div>
            <div>
              <dt>토요일</dt>
              <dd>예약제 운영</dd>
            </div>
          </dl>
        </aside>
      </section>
      <section id="about" className="section intro">
        <div>
          <label>ABOUT US</label>
          <h2>
            {s.homepage.aboutTitleLine1}
            <br />
            {s.homepage.aboutTitleLine2}
          </h2>
        </div>
        <div className="copy">
          <p>{s.homepage.aboutText1}</p>
          <p>{s.homepage.aboutText2}</p>
        </div>
        <div className="stats">
          <div>
            <strong>4시간</strong>
            <span>법정 교육과정</span>
          </div>
          <div>
            <strong>당일</strong>
            <span>이수증 발급</span>
          </div>
          <div>
            <strong>실무형</strong>
            <span>현장 사례 교육</span>
          </div>
        </div>
      </section>
      <section id="instructors" className="section instructorSection">
        <div className="head">
          <div>
            <label>INSTRUCTORS</label>
            <h2>강사소개</h2>
          </div>
          <p>현장 경험과 전문성을 갖춘 강사진을 소개합니다.</p>
        </div>
        {s.instructors.length > 0 ? (
          <div className="instructorGrid">
            {s.instructors.map((instructor, i) => (
              <article
                className="instructorCard"
                key={`${instructor.name}-${i}`}
              >
                <div className="instructorPhoto">
                  {instructor.photo ? (
                    <img
                      src={instructor.photo}
                      alt={`${instructor.name} 강사`}
                    />
                  ) : (
                    <span>강사</span>
                  )}
                </div>
                <div className="instructorCopy">
                  {instructor.role && <small>{instructor.role}</small>}
                  <h3>{instructor.name}</h3>
                  {instructor.specialty && <b>{instructor.specialty}</b>}
                  {instructor.bio && <p>{instructor.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="instructorEmpty">
            강사 정보는 관리자 페이지에서 등록할 수 있습니다.
          </div>
        )}
      </section>
      <section id="schedule" className="band">
        <div className="section">
          <div className="head">
            <div>
              <label>SCHEDULE</label>
              <h2>교육 일정</h2>
            </div>
            <p>방문 전 일정을 확인하세요.</p>
          </div>
          <div className="rows">
            {schedule.map((x) => (
              <article key={x[0]}>
                <div>
                  <b>{x[0]}</b>
                  <span>{x[1]}</span>
                </div>
                <h3>건설업 기초안전보건교육</h3>
                <mark>접수 가능</mark>
              </article>
            ))}
          </div>
          <a className="scheduleMore" href="/schedule">
            월간 교육일정 달력 보기 →
          </a>
        </div>
      </section>
      <section id="facility" className="section">
        <div className="head">
          <div>
            <label>FACILITY</label>
            <h2>교육사진</h2>
          </div>
          <p>쾌적한 교육 현장을 확인하세요.</p>
        </div>
        <div className="gallery">
          {s.photos.map((x, i) => (
            <figure className={i === 0 ? "big" : ""} key={i}>
              <img src={x.url} alt={x.title} />
              <figcaption>{x.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      {s.noticeEnabled && (
        <section className="section notice">
          <div className="head">
            <div>
              <label>NOTICE</label>
              <h2>교육 안내</h2>
            </div>
          </div>
          <div className="cards">
            <article>
              <small>공지</small>
              <h3>{s.noticeTitle}</h3>
              <p>{s.noticeText}</p>
            </article>
            <article>
              <small>접수</small>
              <h3>당일 접수 가능</h3>
              <p>방문 전 전화 문의를 권장합니다.</p>
            </article>
            <article>
              <small>주차</small>
              <h3>교육생 주차 안내</h3>
              <p>교육생 주차 공간이 있습니다.</p>
            </article>
          </div>
        </section>
      )}
      <section className="preparationBand" aria-labelledby="preparation-title">
        <div className="section preparation">
          <div>
            <label>BEFORE CLASS</label>
            <h2 id="preparation-title">교육 당일 준비물</h2>
          </div>
          <div className="preparationItems">
            <article>
              <strong>01</strong>
              <h3>신분증 필수</h3>
              <p>본인 확인을 위해 반드시 지참해 주세요.</p>
            </article>
            <article>
              <strong>02</strong>
              <h3>20분 전 도착</h3>
              <p>원활한 접수를 위해 교육 시작 전에 도착해 주세요.</p>
            </article>
            <article>
              <strong>03</strong>
              <h3>교육비 확인</h3>
              <p>현재 교육비는 {s.fee}입니다.</p>
            </article>
          </div>
        </div>
      </section>
      {s.faqEnabled && s.faqs.length > 0 && (
        <section id="faq" className="section faqSection">
          <div className="head">
            <div>
              <label>FAQ</label>
              <h2>자주 묻는 질문</h2>
            </div>
            <p>방문 전 많이 궁금해하시는 내용을 확인하세요.</p>
          </div>
          <FaqSection items={s.faqs} />
        </section>
      )}
      <section id="resources" className="resourcesBand">
        <div className="section">
          <div className="head">
            <div>
              <label>RESOURCES</label>
              <h2>자료실</h2>
            </div>
            <p>안전교육과 현장에 필요한 자료입니다.</p>
          </div>
          <div className="resourceGrid">
            {s.resources.map((x, i) => (
              <a
                href={x.url}
                target="_blank"
                rel="noreferrer"
                className="resourceCard"
                key={i}
              >
                {x.image ? (
                  <img src={x.image} alt="" />
                ) : (
                  <div className="fileIcon">PDF</div>
                )}
                <div>
                  <small>안전교육 자료</small>
                  <h3>{x.title}</h3>
                  <p>{x.description}</p>
                  <b>자료 열기 ↗</b>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section id="links" className="section">
        <div className="head">
          <div>
            <label>RELATED SITES</label>
            <h2>관련사이트</h2>
          </div>
          <p>안전·건설 관련 공식기관 바로가기</p>
        </div>
        <div className="linkGrid">
          {s.relatedSites.map((x, i) => (
            <a href={x.url} target="_blank" rel="noreferrer" key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{x.title}</b>
              <i>↗</i>
            </a>
          ))}
        </div>
      </section>
      <section id="location" className="location">
        <a
          className="map"
          href={naverMap}
          target="_blank"
          rel="noreferrer"
        >
          <i>●</i>
          <b>네이버지도에서 위치 확인</b>
          <span>{s.address}</span>
        </a>
        <div>
          <label>LOCATION</label>
          <h2>오시는 길</h2>
          <h3>한국안전교육</h3>
          <p>
            <b>{s.address}</b>
          </p>
          <hr />
          <p>
            전화 {s.phone}
            <br />
            팩스 {s.fax}
            <br />
            교육생 주차 가능
          </p>
          <div className="mapActions">
            <a href={naverMap} target="_blank" rel="noreferrer">
              네이버지도 길찾기
            </a>
            <a href={kakaoMap} target="_blank" rel="noreferrer">
              카카오맵 길찾기
            </a>
          </div>
        </div>
      </section>
      <section className="section qrSection">
        <img src="/homepage-qr.png" alt="한국안전교육 공식 홈페이지 QR 코드" />
        <div>
          <label>SHARE</label>
          <h2>휴대전화로 일정 확인</h2>
          <p>
            QR 코드를 스캔하면 한국안전교육 공식 홈페이지로 바로 연결됩니다.
            명함과 홍보물에도 같은 주소를 사용할 수 있습니다.
          </p>
          <ShareButton />
        </div>
      </section>
      <section id="contact" className="contact">
        <label>교육 신청 및 문의</label>
        <h2>{s.homepage.contactTitle}</h2>
        <p>{s.homepage.contactText}</p>
        <div>
          <a className="button lime" href={`tel:${tel}`}>
            전화 상담 {s.phone}
          </a>
          <a
            className="button line"
            href={`sms:${SMS_RECIPIENT}?body=${smsText}`}
          >
            문자 문의
          </a>
        </div>
      </section>
      <footer>
        <div className="brand">
          <img src="/korea-safety-symbol.png" alt="한국안전교육 심볼" />
          <span>
            <b>한국안전교육</b>
            <small>KOREA SAFETY EDUCATION</small>
          </span>
        </div>
        <p>
          대표자 최현주·안정현 | 사업자등록번호 217-86-02371
          <br />
          {s.address} | 전화 {s.phone} | 팩스 {s.fax}
          <br />© 2026 한국안전교육
        </p>
        <a href="/admin">관리자</a>
        <a href="#top">맨 위로 ↑</a>
      </footer>
      <MobileActions phone={s.phone} address={s.address} />
    </main>
  );
}
