# moa-web

한국안전교육 홈페이지의 소스 관리 저장소입니다. 교육 안내, 월간 교육일정,
온라인 예약·취소, 관리자용 콘텐츠·일정·신청자 관리 기능을 포함합니다.

## 원본과 실행 환경

- 원본 사이트: https://korea-safety-education.c7609chj8.chatgpt.site/
- 가져온 기준: Sites 버전 18, 커밋 `819d00b5352aa342870c480d1442cd7e2b801899`
- React 19 / Vinext / Vite / TypeScript / Tailwind CSS
- 서버: Cloudflare Workers, 데이터: D1, 업로드 파일: R2
- `.openai/hosting.json`은 기존 Sites 프로젝트와 DB·파일 바인딩을 유지합니다.
- GitHub 소스에는 운영 DB의 신청자 정보, R2 업로드 파일, 인증 토큰이 포함되지 않습니다.

## 주요 경로

| 경로 | 역할 |
| --- | --- |
| `app/page.tsx` | 홈페이지 |
| `app/schedule/` | 월간 교육일정 |
| `app/apply/`, `app/cancel/` | 예약 신청·취소 |
| `app/admin/` | 관리자 화면 |
| `app/api/` | 예약·관리·파일 API |
| `lib/` | 설정·일정·예약 처리 |
| `db/`, `drizzle/` | DB 스키마·마이그레이션 |
| `tests/` | 기존 회귀·UI 테스트 |

## 검증과 개발

Node.js 22.13 이상이 필요합니다. 의존성 없이 실행 가능한 소스 검사는 다음과 같습니다.

```sh
node --test tests/rendered-html.test.mjs tests/safety-regressions.test.mjs
```

기존 설치·빌드 스크립트는 Linux의 Bash, flock, curl, GNU timeout을 사용합니다.
Windows에서는 WSL 등 Linux 환경에서 실행하세요.

```sh
npm run install:ci
npm run dev
# 변경 후 빌드와 전체 테스트
npm test
```

로컬 DB는 운영 DB와 별개입니다. 예약 기능을 로컬에서 검증하려면 D1 마이그레이션을
적용한 테스트 DB가 필요합니다. 관리자 인증은 Sites에서 주입하는 인증 헤더에
의존하므로 다른 호스팅으로 이전할 때 인증 계층을 별도로 설계해야 합니다.

## 작업과 반영 원칙

1. 요청 범위에 맞춰 소스를 수정합니다.
2. 변경에 맞는 검증을 실행하고 실패·미실행 항목을 기록합니다.
3. 비밀정보와 운영 개인정보가 커밋에 포함되지 않는지 확인합니다.
4. Git 커밋 후 이 저장소로 푸시하고 커밋·검증 결과를 보고합니다.
5. GitHub 푸시와 운영 사이트 배포는 별개입니다. 운영 반영 요청 시 Sites 배포 절차를 따릅니다.

분석 내용과 미해결 항목은 [소스 검토 기록](docs/source-review.md),
원본 실행 안내는 [스타터 문서](docs/upstream-starter.md)를 참고하세요.
