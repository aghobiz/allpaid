# allpaid (올페이드)

> **모든 참여자가 납부를 완료한 상태다(Everyone has paid)**

---

## 📋 목차 (Table of Contents)

1. [서비스 개요](#1-서비스-개요-service-overview)
2. [문제 정의](#2-문제-정의-the-problem-we-solve)
3. [해결책](#3-해결책-our-solution)
4. [기술 스택](#4-기술-스택-tech-stack)
5. [실행 방법](#5-실행-방법-how-to-run)
6. [주요 기능 상세](#6-주요-기능-상세-detailed-features)
7. [화면 구성](#7-화면-구성-screen-structure)
8. [데이터 구조](#8-데이터-구조-data-structure)
9. [향후 개발 계획](#9-향후-개발-계획-future-development)

---

## 1. 서비스 개요 (Service Overview)

**allpaid(올페이드)**는 대학 내 학생회, 동아리 등 멤버가 유동적인 단체의 회비 관리를 자동화하여,  
총무의 행정 부담을 없애고 자금 흐름을 투명하게 만드는  
**비공식 단체를 위한 간편 회계 SaaS(서비스형 소프트웨어)**입니다.

기존의 모임통장 서비스들이 해결하지 못했던  
행사마다 참여자가 바뀌는 상황에서의 복잡한 정산 및 인원 관리 문제를  
완벽하게 해결하는 것을 목표로 합니다.

---

## 2. 문제 정의 (The Problem We Solve)

> **총무의 지옥도: 4개의 툴, 5시간의 노동, 그리고 1개의 실수**

- 기존 단체 총무들은 한 번의 행사를 위해  
  **카카오톡(공지), 엑셀(명단 정리), 개인 은행 앱(입금 확인), 한글(결산 보고)**  
  4개의 툴을 오가며 평균 5시간 이상의 단순 반복 작업을 수행하고 있습니다.

- **파편화된 툴 사용**: 여러 도구를 오가며 발생하는 극심한 비효율  
- **유동적 참여자 관리의 복잡성**:  
  - 참여 신청 후 미입금, 갑작스러운 불참 및 환불 요구,  
    미신청 후 참여 등 실시간으로 변하는 인원 현황을 수동으로 관리하는 고통  
- **회계 투명성 증빙의 압박**:  
  - 모든 자금 흐름을 수작업으로 정리하고, 이를 증빙해야 하는 부담감

**'allpaid(올페이드)'는 바로 이 명확한 고통(Pain Point)을 해결하기 위해 탄생했습니다.**

---

## 3. 해결책 (Our Solution)

**'allpaid(올페이드)'는 총무의 모든 수작업을 '자동화'하여,  
이들의 고통을 완벽하게 해결하는 똑똑한 총무 비서입니다.**

### 핵심 기능

- **자동 집계 모집 폼**  
  - 총무는 행사(프로젝트)별로 **'참가 신청 링크'**를 생성하고 공유하기만 하면 됩니다.  
  - 신청자가 정보를 입력하면, 총무의 대시보드에 실시간으로 자동 집계되어  
    더 이상 수동으로 명단을 정리할 필요가 없습니다.

- **프로젝트별 가상계좌**  
  - 각 프로젝트는 독립된 가상계좌를 발급받아,  
    모임의 메인 통장과 자금이 섞일 위험 없이 100% 정확한 자동 정산을 실현합니다.

- **실시간 자동 정산 대시보드**  
  - 멤버별 입금 상태(입금 완료/입금 대기/취소)와 총 모금 현황을 실시간으로 보여줍니다.

- **유동적 멤버 관리**  
  - 총무는 대시보드에서 멤버의 상태를 손쉽게 변경할 수 있으며,  
    참가자는 자신만의 페이지에서 직접 참여를 취소할 수 있습니다.  
  - 모든 변경 사항은 전체 정산에 즉시 반영됩니다.

- **원클릭 회계 보고서**  
  - 모든 입출금 내역을 바탕으로, 학생회 감사에 제출할 수 있는 수준의  
    투명한 정산 보고서(PDF)를 자동으로 생성합니다.

---

## 4. 기술 스택 (Tech Stack)

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: 
  - Pretendard (본문)
  - Paperlogy (로고/타이틀)
- **Emojis**: OpenMoji (머니백 아이콘)
- **은행 로고**: Simple Icons CDN + 로컬 파일

---

## 5. 실행 방법 (How to Run)

본 프로젝트는 현재 프론트엔드 프로토타입 버전입니다.  
아래의 방법으로 로컬 환경에서 실행할 수 있습니다.

1. 프로젝트 파일들을 다운로드합니다:
   - `index.html` (메인 HTML 파일)
   - `style.css` (스타일시트)
   - `app.js` (JavaScript 로직)
   - `bank-logos/` 폴더 (은행 로고 이미지)
2. 다운로드한 파일들을 모두 하나의 폴더에 위치시킵니다.
3. 웹 브라우저(Chrome, Safari, Firefox 등)에서 `index.html` 파일을 엽니다.

---

## 6. 주요 기능 상세 (Detailed Features)

### 🏠 홈 화면 (Home Screen)
- **브랜드 타이틀**: "allpaid(올페이드)" 로고 (Paperlogy 폰트)
- **주요 기능 버튼**: 영수증 등록, 원클릭 회계, 총무 도우미, 정산 현황
- **모임 만들기**: 새 모임 생성 버튼
- **내가 관리하는 모임**: 등록된 모임 목록 표시
- **하단 네비게이션**: 홈, 알림, 마이페이지

### 🏢 모임 관리 (Group Management)
- **모임 생성**: 이름, 설명, 은행 정보, 계좌번호, 예금주 입력
- **지원 은행**: 카카오뱅크, 토스뱅크, KB국민은행, 신한은행, 하나은행
- **모임 상세**: 잔액, 멤버 수, 활동 내역 표시
- **은행 로고**: 각 은행별 로고 자동 표시
- **계좌번호 복사**: 클립보드에 계좌번호 복사 기능

### 💰 프로젝트 관리 (Project Management)
- **프로젝트 생성**: 이름, 회비, 참가 안내 문구 설정
- **가상계좌**: 프로젝트별 독립 가상계좌 자동 생성
- **참가 신청 링크**: 공유 가능한 참가 신청 URL 생성
- **실시간 정산 현황**: 입금 완료율, 모금 현황 실시간 표시
- **멤버 관리**: 입금 완료/대기/취소 상태 관리

### 📊 정산 기능 (Settlement Features)
- **일일거래장부**: 
  - 해당 프로젝트의 입금자별 개별 내역 표시
  - 프로젝트 생성일 이후 지출 내역 포함
  - 날짜별 정렬, 인쇄/복사 기능
- **정산 요청**: 
  - 미정산 멤버 목록 표시
  - 정산 요청 메시지 자동 생성 및 복사
  - 일괄 정산 요청 발송 기능
- **재정감사**: 
  - 모임 전체 재정 현황 모달 표시
  - 활동별 상세 내역 확인

### 👥 참가자 관리 (Participant Management)
- **참가 신청**: 이름, 연락처 입력으로 간편 신청
- **상태 확인**: 개인별 참가 상태 및 입금 현황 확인
- **신청 취소**: 참가 신청 취소 기능
- **멤버 추가**: 총무가 직접 멤버 추가 가능
- **필터링**: 전체/입금 완료/입금 대기/취소별 필터링

### 💸 지출 관리 (Expense Management)
- **지출 기록**: 지출 내역, 금액 입력
- **자동 정산**: 지출이 전체 잔액에 자동 반영
- **지출 내역**: 모임별 지출 내역 조회

### 🔔 알림 시스템 (Notification System)
- **실시간 알림**: 입금, 프로젝트 생성, 마감일 알림
- **알림 목록**: 시간순 정렬된 알림 내역
- **알림 타입**: 입금 완료, 프로젝트 생성, 마감일 임박

### 👤 마이페이지 (My Page)
- **사용자 정보**: 프로필 정보 표시
- **메뉴**: 공지사항, 고객센터, 이용약관, 로그아웃

### 🎨 UI/UX 특징
- **SPA 구조**: 페이지 새로고침 없이 화면 전환
- **반응형 디자인**: 모바일 최적화
- **모던 UI**: 깔끔한 카드 기반 레이아웃
- **애니메이션**: 부드러운 화면 전환 효과
- **플로팅 버튼**: 빠른 액세스를 위한 FAB
- **모달 시스템**: 상세 정보 표시용 모달

---

## 7. 화면 구성 (Screen Structure)

### 메인 화면들
1. **홈 화면** (`home-screen`)
2. **모임 상세 화면** (`group-detail-screen`)
3. **새 모임 만들기 화면** (`add-group-screen`)
4. **프로젝트 상세 화면** (`project-detail-screen`)
5. **새 활동 추가 화면** (`add-activity-screen`)
6. **알림 화면** (`notifications-screen`)
7. **마이페이지 화면** (`my-page-screen`)
8. **참가 신청 화면** (`apply-screen`)

### 모달들
- **상세 정보 모달** (`detail-modal`)
- **참가 신청 폼 모달** (`applicant-modal`)

### 네비게이션
- **하단 네비게이션 바**: 홈, 알림, 마이페이지
- **뒤로가기 버튼**: 각 화면별 뒤로가기
- **플로팅 액션 버튼**: 새 활동 추가

---

## 8. 데이터 구조 (Data Structure)

### Mock Database (state 객체)
```javascript
{
  groups: [
    {
      id: number,
      name: string,
      description: string,
      icon: string,
      bank: string,
      accountNumber: string,
      accountHolder: string
    }
  ],
  activities: [
    {
      type: 'project' | 'expense',
      id: number,
      groupId: number,
      name: string,
      createdAt: string,
      fee: number,
      description: string,
      virtualAccountNumber: string,
      members: [
        {
          name: string,
          feeToPay: number,
          status: 'paid' | 'unpaid' | 'cancelled'
        }
      ]
    }
  ],
  notifications: [
    {
      id: number,
      icon: string,
      color: string,
      message: string,
      time: string
    }
  ]
}
```

---

## 9. 향후 개발 계획 (Future Development)

### 단기 계획 (1-2개월)
- [ ] 백엔드 API 연동
- [ ] 실제 은행 API 연동
- [ ] 사용자 인증 시스템
- [ ] 데이터베이스 구축

### 중기 계획 (3-6개월)
- [ ] 모바일 앱 개발 (React Native)
- [ ] 카카오톡 연동 (알림 발송)
- [ ] 자동 입금 확인 시스템
- [ ] 정산 리포트 PDF 생성

### 장기 계획 (6개월 이상)
- [ ] AI 기반 예측 분석
- [ ] 다국어 지원
- [ ] 엔터프라이즈 버전
- [ ] API 오픈 플랫폼

---

## 📞 문의 및 제안

더 나은 allpaid(올페이드)를 위해 언제든 피드백을 환영합니다!

- **이메일**: allpaid@allpaid.com
- **GitHub**: [프로젝트 저장소 링크]
- **문의사항**: 기능 제안, 버그 리포트, 협업 제안 등

---

allpaid(올페이드) - 총무의 고통을 끝내는 스마트한 솔루션 🚀 