# miniERP

> 유통 도메인 기반 미니 ERP 시스템

[![Java](https://img.shields.io/badge/Java-17-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev/)

---

## 프로젝트 소개

> 🔗 **배포 링크**: [https://mini-erp-frontend-mu.vercel.app](https://mini-erp-frontend-mu.vercel.app)

유통 MD/SCM 실무 경험을 바탕으로 설계한 ERP 포트폴리오 프로젝트입니다.
협력사-브랜드-상품 마스터 관리부터 발주/입고, 재고 수불, 판매, 정산까지
실제 유통 운영 흐름을 그대로 구현합니다.

### 기획 배경

실무(웰컴인터내셔널 MD/SCM)에서 직접 겪은 비효율을 시스템화한 프로젝트입니다.

**입고·출고**
- 지점: 협력사·제조업체 → 본사 창고 입고(ERP `ubi-plus`) → 지점 출고(`ubi-plus`)
- 면세점: 협력사·제조업체 → 본사 창고 입고(`ubi-plus`) → 입고 내용 면세점 신고 → 통관업체를 통해 입고

**판매**
- 지점: 지점 POS 판매 → 현장에서 `ubi-plus`에 수기 입력
- 면세점: 면세점 POS 판매 → 월말에 판매 데이터 일괄 인계 (POS 시스템에 API가 없고 외부 조회 자체가 불가능해 수기 정리 필요)

**정산(월말)**
- 입고·출고 및 판매 내역 로우데이터를 다운로드해 엑셀로 재정리 → 업체별 상품 분리 → 협력사별 정산 진행

채널마다 시스템이 분리되어 있고 일부는 외부 연동이 원천적으로 불가능해, 모든 단계에서 수동 이중입력과 엑셀 재가공이 반복되는 구조였습니다.

**GWP/BOM 재고 미추적**
- 지점: 매달 진행하는 프로모션이 매번 달라 판매가를 매달 초 수기로 변경
- 면세점: N+1 같은 묶음 프로모션이 많아 입고 시마다 입수단위에 맞춰 별도로 계산해야 함
- 결과적으로 행사 중 GWP 소진 여부를 실시간으로 파악할 수 없어, 다 떨어진 뒤에야 알게 되는 경우 발생

**발주량 예측**
- 판매 데이터를 매주 추출해 소진 예상 제품을 계산, 발주량을 산정하는 작업도 전부 수기 엑셀로 진행 (별도 계산 로직 필요)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Java 17, Spring Boot 4.0.6, Spring Data JPA, Spring Security 7 |
| Frontend | React 19, Vite 8, Axios, React Router |
| Database | PostgreSQL 17 |
| Auth | JWT (jjwt 0.12.6), BCrypt |
| Build | Gradle |
| 배포 | Supabase (DB), Railway (Backend), Vercel (Frontend) |

---

## ERD

> 인터랙티브 ERD: [miniERP_ERD_v4.html](https://terryblackhoodwoo.github.io/miniErpERD/)

### 테이블 구성 (15개)

**인증 영역**
- `app_user` 시스템 사용자 (JWT 인증)

**상품 영역**
- `vendor` 협력사 / `brand` 브랜드 / `product` 상품
- `product_document` 상품 서류 (수입필증, BSE, KC인증)
- `bom` BOM 구성 (세트/GWP/샘플)

**물류 영역**
- `store` 지점 / `warehouse` 창고 / `warehouse_store` 창고-지점 매핑
- `gwp` GWP 증정품 / `promotion` 프로모션
- `purchase_order` 발주/입고 / `inventory` 통합 수불부

**판매/정산 영역**
- `sales` 판매 (온/오프라인 채널 구분)
- `settlement` 월별 정산 (면세점 마감 내역서 구조)

---

## 핵심 설계 포인트

### 1. 원가 계산 유연성
```
계약 형태에 따라 원가 기준 선택 가능
- 완사입: cost_price (매입원가 직접 입력)
- 위탁: supply_cost (공급원가 직접 입력)
- 미입력 시: retail_price or sale_price × supply_rate 자동 계산
             (cost_base 컬럼으로 기준 선택)
```

### 2. LOT 기반 재고 관리
```
입고 시 lot_no + expire_date 기록
→ 유통기한 임박 알림 가능
→ 리콜 발생 시 해당 LOT 즉시 추적
→ current_stock View로 실시간 현재고 조회
```

### 3. 파레트 단위 물류비 자동계산
```
product: qty_per_box (박스당 EA) + box_per_pallet (파레트당 박스)
warehouse: cost_per_pallet (파레트당 물류비)

입고수량 입력 시:
box_count     = CEIL(received_qty ÷ qty_per_box)
pallet_count  = CEIL(box_count ÷ box_per_pallet)
logistics_cost = pallet_count × cost_per_pallet  ← 자동계산
```

### 4. 채널별 판매 추적
```
sales.channel = 'ONLINE' | 'OFFLINE'
sales.order_no = 온라인 주문번호 (네이버, 쿠팡 등)
→ 플랫폼 API 연동 확장 가능 구조
```

### 5. 정산 구조
```
월마감 시 스냅샷 저장 방식
기초재고 + 입고 - 반출 = 기말재고
판매금액 → 공급가액 → 부가세 → 세금계산서 → 실지급액
```

### 6. 영업이익 계산 구조
```
매출액   = sale_qty × sale_price
매출원가 = sale_qty × (cost_price or supply_cost)
물류비   = 해당 기간 purchase_order.logistics_cost 합계
─────────────────────────────────────────────────
영업이익 = 매출액 - 매출원가 - 물류비
```

---

## 시작하기

### 사전 요구사항
- Java 17+
- PostgreSQL 17+
- Gradle
- Node.js 18+ / Yarn

### 백엔드 실행

```bash
# 레포 클론
git clone https://github.com/TerryBlackhoodWoo/miniErp.git
cd miniErp

# DB 생성 (DBeaver 또는 psql)
CREATE DATABASE minierp;

# DDL 실행
psql -U postgres -d minierp -f docs/miniERP_final_v3.sql

# application.yml 설정 (gitignore 제외 - 직접 생성 필요)
# src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/minierp
    username: postgres
    password: your_password
    driver-class-name: org.postgresql.Driver
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080

jwt:
  secret: your-secret-key-32-chars-minimum!!

# 서버 실행
./gradlew bootRun
```

### 프론트엔드 실행

```bash
cd miniERP_frontend
yarn install
yarn dev --host
```

### 접속
```
http://localhost:5173
```

> 기본 계정: 회원가입 후 이용 (`POST /api/auth/register`)

---

## API 엔드포인트

### 인증
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/login` | 로그인 → JWT 토큰 발급 |
| POST | `/api/auth/register` | 회원가입 → 아이디 중복 시 409 |

> 인증 이후 모든 요청에 `Authorization: Bearer {token}` 헤더 필요

### 마스터 데이터
| 도메인 | GET | POST | PUT | DELETE |
|--------|-----|------|-----|--------|
| 협력사 | `GET /api/vendors` | `POST /api/vendors` | `PUT /api/vendors/{id}` | `DELETE /api/vendors/{id}` |
| 브랜드 | `GET /api/brands` | `POST /api/brands` | `PUT /api/brands/{id}` | `DELETE /api/brands/{id}` |
| 상품 | `GET /api/products` | `POST /api/products` | `PUT /api/products/{id}` | `DELETE /api/products/{id}` |
| 지점 | `GET /api/stores` | `POST /api/stores` | `PUT /api/stores/{id}` | `DELETE /api/stores/{id}` |
| 창고 | `GET /api/warehouses` | `POST /api/warehouses` | `PUT /api/warehouses/{id}` | `DELETE /api/warehouses/{id}` |

### 상품 이미지
| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/products/{id}/image` | 상품 이미지 업로드 (multipart) → `image_url` 자동 갱신 |

> 업로드된 이미지는 `/uploads/products/`에 저장되며 `/uploads/**` 정적 리소스로 서빙됩니다.

### 운영
| 도메인 | GET | POST | 기타 |
|--------|-----|------|------|
| 상품서류 | `GET /api/product-documents` | `POST /api/product-documents` | |
| BOM | `GET /api/boms` | `POST /api/boms` | |
| GWP | `GET /api/gwps` | `POST /api/gwps` | |
| 프로모션 | `GET /api/promotions` | `POST /api/promotions` | |
| 발주/입고 | `GET /api/purchase-orders` | `POST /api/purchase-orders` (등록, status=PENDING) | `POST /api/purchase-orders/{id}/receive` (입고 처리 — LOT/유통기한/물류메모 입력 → 박스/파레트/물류비 자동계산 → `inventory` IN 1건 생성, status=RECEIVED) / `POST /api/purchase-orders/{id}/allocate` (배분 승인 — 창고 OUT + 지점 IN 2건 생성, status=COMPLETED, `@Transactional`) |
| 수불부 | `GET /api/inventories` | `POST /api/inventories` | `GET /api/inventories/ledger` (Product/Warehouse/Store join DTO) |
| 현재고 | `GET /api/current-stock` | - | 네이티브 쿼리 + JOIN DTO 응답 (`CurrentStockDto` — 브랜드명·상품명·창고명·지점명·원가 포함) |
| 판매 | `GET /api/sales` | `POST /api/sales` (FIFO LOT 자동 차감, 재고부족 시 409 응답) | |
| 정산 | `GET /api/settlements` | `POST /api/settlements` | |

> **발주 흐름 (v0.6.0 기준)**: 발주(PENDING) → 입고 처리(`/receive`, 협력사→창고 IN 1건, RECEIVED) → 배분 승인(`/allocate`, 창고 OUT + 지점 IN 2건, COMPLETED) 3단계로 통일되었습니다. 기존 `is_direct`(직배송) 분기는 제거되었습니다.

---

## 프로젝트 구조

```
miniERP/
├── src/
│   ├── main/
│   │   ├── java/com/minierp/minierp/
│   │   │   ├── auth/            # JWT 인증 (JwtUtil, JwtFilter, AuthController)
│   │   │   ├── entity/          # JPA Entity (15개)
│   │   │   ├── repository/      # JpaRepository (15개)
│   │   │   ├── service/         # 비즈니스 로직 (PurchaseOrderService, SalesService)
│   │   │   ├── controller/      # REST API (14개)
│   │   │   ├── SecurityConfig   # Spring Security + CORS 설정
│   │   │   └── WebConfig        # 정적 리소스 매핑 (/uploads/** → uploads/)
│   │   └── resources/
│   │       └── application.yml  # (gitignore 제외 - 직접 생성 필요)
│   └── test/
├── uploads/
│   └── products/                # 업로드된 상품 이미지 (gitignore 제외)
├── build.gradle
└── README.md

miniERP_ERD/(https://terryblackhoodwoo.github.io/miniErpERD/ 배포 中)
├── index.html                  # 인터랙티브 ERD
├── miniERP_DB_script.sql       # DDL
└── miniERP.png                 # html 로고

miniERP_frontend/
├── src/
│   ├── api/
│   │   └── axios.js              # axios 인스턴스 (JWT 자동 첨부, VITE_API_BASE_URL 환경변수)
│   ├── components/
│   │   ├── ui.jsx                # 공용 컴포넌트 (Modal, Field, Badge, ImageBox 등)
│   │   ├── index.js               # 팝업 컴포넌트 re-export
│   │   ├── shared.jsx             # genCode, PopupFooter (공용)
│   │   └── popup/
│   │       ├── ProductRegisterPopup.jsx
│   │       ├── BrandRegisterPopup.jsx
│   │       ├── VendorRegisterPopup.jsx
│   │       ├── WarehouseRegisterPopup.jsx
│   │       ├── StoreRegisterPopup.jsx
│   │       ├── PurchaseOrderRegisterPopup.jsx  # 발주 등록 (지점/경유창고/상품/수량)
│   │       ├── ReceivePopup.jsx                # 입고 처리 (LOT/유통기한/물류메모)
│   │       └── SalesRegisterPopup.jsx          # 판매 등록 (채널/지점/상품/수량/판매가)
│   ├── pages/
│   │   ├── Login.jsx              # 로그인 / 회원가입 (탭 전환)
│   │   ├── Dashboard.jsx          # 대시보드 (현재고·매출·발주 실DB 연동)
│   │   ├── MasterData.jsx         # 기초정보 관리 (탭 전환 + 데이터 fetch)
│   │   ├── master-tabs/
│   │   │   ├── ProductTab.jsx     # 상품 탭 (테이블 + CRUD)
│   │   │   ├── BrandTab.jsx       # 브랜드 탭
│   │   │   ├── VendorTab.jsx      # 협력사 탭
│   │   │   ├── WarehouseTab.jsx   # 창고 탭
│   │   │   └── StoreTab.jsx       # 지점 탭
│   │   ├── PurchaseOrder.jsx      # 발주·입고 페이지 (입고대기/배분대기/발주목록 3단 구성)
│   │   ├── purchase-tabs/
│   │   │   ├── ReceiveTab.jsx        # 입고 대기 목록 (PENDING) + 입고 처리
│   │   │   ├── AllocateTab.jsx       # 배분 대기 목록 (RECEIVED) + 배분 승인
│   │   │   └── PurchaseOrderTab.jsx  # 전체 발주 목록 + 등록 팝업
│   │   ├── Inventory.jsx          # 재고 수불 (현재고 요약 + 입출고 이력, current_stock/inventory 실DB 연동)
│   │   ├── Sales.jsx              # 판매 등록 및 이력
│   │   └── Settlement.jsx         # 정산
│   ├── App.jsx
│   └── index.css
└── package.json
```

---

## 개발 현황

### v0.1.0 - 기반 구축_2026.06.11
- [x] 프로젝트 초기 설정 (Spring Boot + PostgreSQL)
- [x] ERD 설계 완료 (15개 테이블)
- [x] DB DDL 작성
- [x] Entity / Repository / Controller 작성
- [x] PUT / DELETE API 추가
- [x] React 프론트엔드 기본 구조 (더미 데이터 기반)
- [x] 대시보드 / 상품 / 재고 / 정산 UI

### v0.2.0 - 인증 + 마스터 데이터 연동_2026.06.12
- [x] JWT 인증 구현 (JwtUtil / JwtFilter / AuthController)
- [x] `app_user` 테이블 + BCrypt 계정 관리
- [x] Spring Security JWT 방식 전환 + CORS 설정
- [x] 프론트 로그인 페이지 + 토큰 저장 / 자동 로그아웃
- [x] axios 인스턴스 (JWT 자동 첨부)
- [x] 상품 / 브랜드 / 협력사 / 창고 마스터 실DB 연동
- [x] 브랜드 등록 팝업 추가
- [x] `warehouse` 테이블 컬럼 확장 (type / location / manager / phone / status)

### v0.3.0 - 기초정보 고도화 1 (물류비 + 입수단위 + 지점)_2026.06.12
- [x] 지점(`store`) 탭 추가 및 등록 팝업
- [x] `product` 컬럼 추가 — `qty_per_box` (박스당 EA), `box_per_pallet` (파레트당 박스), `image_url`
- [x] `warehouse` 컬럼 추가 — `cost_per_pallet` (파레트당 물류비)
- [x] `purchase_order` 컬럼 추가 — LOT (`lot_no`, `expire_date`), 물류비 자동계산 (`box_count`, `pallet_count`, `logistics_cost`), 실입고 (`received_qty`, `received_at`)
- [x] 상품 등록 팝업 — 박스/파레트 입수단위 필드 추가
- [x] 창고 등록 팝업 — 파레트 단가 필드 추가
- [x] 상품 테이블 컬럼 개편 (용량, 매입/공급/제조원가 분리 표시)

### v0.4.0 - 기초정보 고도화 2 (수정 기능 + 이미지 업로드)_2026.06.15
- [x] 등록 팝업 컴포넌트 분리 (`components/popup/*`, `shared.jsx`, `index.js`)
- [x] `MasterData` 페이지 분리 — 탭별 컴포넌트(`master-tabs/*`)로 구조 정리
- [x] 상품 / 브랜드 / 협력사 / 창고 / 지점 수정 기능 (row 클릭 → 수정 팝업, PK 필드 비활성화)
- [x] `product` 컬럼 추가 — `tax_free` (면세/과세 여부)
- [x] 상품 테이블 — 면세/과세 Badge, 입수단위(박스×파레트) 컬럼 표시
- [x] 상품 이미지 업로드 실연동 (`POST /api/products/{id}/image`, multipart)
- [x] `ImageBox` 실연동 — 등록/수정 시 파일 업로드, 기존 이미지 미리보기 (`value`/`onFileSelect` props, `useEffect` 동기화)
- [x] `WebConfig` 신규 추가 — 정적 리소스 매핑 (`/uploads/**` → `uploads/` 디렉토리)
- [x] `SecurityConfig` — `/uploads/**` permitAll 추가
- [x] multipart 업로드 용량 설정 (10MB)

### v0.5.0 - 발주 · 입고_2026.06.15
- [x] `PurchaseOrderService` 신규 — Service 레이어 비즈니스 로직 도입
- [x] 발주 등록 화면 (`PurchaseOrder.jsx` + `purchase-tabs/PurchaseOrderTab.jsx` + `PurchaseOrderRegisterPopup.jsx`)
- [x] 입고 처리 (`POST /api/purchase-orders/{id}/receive`) — LOT/유통기한/물류메모 입력
- [x] 박스/파레트/물류비 자동계산 (`qty_per_box`, `box_per_pallet`, `cost_per_pallet` 기준)
- [x] 입고 시 `inventory` 자동 생성 (IN 수불, `@Transactional`)
- [x] `purchase_order` 컬럼 추가 — `is_direct` (직배송 여부)
- [x] 직배송 분기 처리 — 일반 입고는 "협력사→창고"+"창고→지점" 2건, 직배송은 "협력사→지점" 1건 생성
- [x] ERD v4 / DDL v3 정리 (ALTER 병합, `tax_free`/`is_direct` 반영, 좌표 재배치)

### v0.6.0 - 재고 조회 + 발주/입고 구조 재설계_2026.06.16
- [x] `current_stock` View용 읽기 전용 Entity/Repository/Controller (`GET /api/current-stock`)
- [x] `Inventory.jsx` 더미 → 실DB 연동 (`GET /api/inventories/ledger` — Inventory+Product+Warehouse+Store join DTO)
- [x] **발주/입고/배분 구조 재설계 (v0.0.5 버그 수정 포함)**
  - 기존 v0.0.5 `/receive`가 "협력사→창고"+"창고→지점" 2건을 동시 생성하면서 OUT 누락 → 재고 중복 집계 버그 발견
  - `is_direct`(직배송) 분기 완전 제거, 모든 발주를 **2단계 흐름**으로 통일
  - 1단계: 발주 등록 (`PENDING`) — 지점 요청, 경유 창고 지정
  - 2단계: 입고 처리 (`POST /api/purchase-orders/{id}/receive`) — 협력사→창고 IN 1건, `status=RECEIVED`
  - 3단계: 배분 승인 (`POST /api/purchase-orders/{id}/allocate`, 신규) — 창고 OUT + 지점 IN 2건, `status=COMPLETED`
- [x] 프론트 — 발주·입고 화면 3단 구조로 분리
  - 입고 대기 (`ReceiveTab.jsx`, `PENDING` 목록 + `ReceivePopup`)
  - 배분 대기 (`AllocateTab.jsx` 신규, `RECEIVED` 목록 + 배분 승인)
  - 발주 목록 (`PurchaseOrderTab.jsx`, 전체 + 상태별 Badge: 입고대기/배분대기/완료)
  - `PurchaseOrderRegisterPopup.jsx` — 직배송 체크박스 제거, "입고 창고" → "경유 창고"로 라벨 변경
  - `App.jsx` — `po` 페이지 중복 렌더링(`ComingSoon` + `PurchaseOrder`) 버그 수정
- [x] `purchase_order.is_direct` 컬럼 완전 제거 (Entity / DDL / DB)
- [x] `inventory` 테스트 데이터 정리 (v0.0.5 시점 잘못 생성된 row 제거, 새 흐름으로 재시작)

### v0.7.0 - 판매_2026.06.16
- [x] 재고 조회 화면 (`Inventory.jsx` 상단 — "현재고" 요약 섹션, `current_stock` 기반, LOT/유통기한/창고·지점 위치 표시, 0 이하 재고 숨김)
- [x] **`current_stock` API 버그 수정** — `@Entity` + `@Immutable` + `@EmbeddedId` 조합에서 PK 컬럼 중 일부가 NULL인 row(창고 또는 지점 단독 보유 시 항상 발생)가 Hibernate에 의해 전체 null로 매핑되는 문제 발견
  - `CurrentStock`/`CurrentStockId` Entity 매핑 방식 폐기, `EntityManager` 기반 네이티브 쿼리 + `Tuple` 매핑으로 전환
  - `CurrentStockRepository`를 `JpaRepository` 대신 `@Repository` 일반 클래스로 변경, `CurrentStockDto` 직접 생성
- [x] 판매 등록 (`sales` 테이블, ONLINE/OFFLINE 채널, `Sales`/`SalesRepository`/`SalesController`)
- [x] `SalesService.createSale()` — 지점 재고 합계 검증 → 부족 시 409 응답 → FIFO(유통기한 빠른 순) LOT 순회하며 `inventory` OUT 생성 (LOT 분할 차감 지원, `@Transactional`)
- [x] `CurrentStockRepository.findAvailableForSale()` — 지점/상품 기준 FIFO 정렬 가용 LOT 조회
- [x] 프론트 — 판매 등록 화면 (`Sales.jsx`, `SalesRegisterPopup.jsx`), 채널별 주문번호 입력 분기, 재고부족 에러 메시지 표시
- [x] 풀 사이클 검증 완료: 발주 → 입고 → 배분 → 판매 → 현재고 반영까지 정상 동작 확인

### v0.8.0 - 배포 준비_2026.06.17
- [x] Supabase (DB) 마이그레이션 — Session Pooler 연결(`aws-1-ap-northeast-1.pooler.supabase.com`), DDL(`miniERP_DB_script.sql`)에서 `is_direct` 잔존 컬럼/코멘트 제거 후 적용, psql로 15개 테이블 + `current_stock` View 전체 재생성
- [x] Railway (Backend) 배포
  - `.tool-versions` 추가 (`java temurin-17`) — railpack 빌더가 기본값(Java 21)을 설치하면서 Gradle toolchain(17) 불일치로 빌드 실패하던 문제 해결
  - Custom Start Command 수정 (`*/build/libs/*jar` → `build/libs/*.jar`) — 단일 모듈 구조에서 jar 경로 패턴이 안 맞아 `ls: cannot access` 오류 발생하던 문제 해결
  - `application.yaml`을 환경변수 참조 방식(`${DATABASE_URL}` 등)으로 재작성, 기존 `.gitignore` 누락(확장자 불일치로 `application.yaml`이 한 번도 ignore되지 않고 로컬 비밀번호가 git 히스토리에 남아있던 사실 확인 — 운영 비밀값은 모두 Railway Variables로 분리해 git 노출 없이 해결)
  - Railway Variables: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` 등록
  - Public Domain 생성 (`minierp-production-596c.up.railway.app`)
- [x] Vercel (Frontend) 배포
  - `axios.js` baseURL을 `import.meta.env.VITE_API_BASE_URL` 환경변수로 분리
  - Vercel Environment Variables에 `VITE_API_BASE_URL` 등록 후 캐시 없이 재배포 (Vite 환경변수는 빌드타임에 고정되므로 변수 추가만으로는 기존 배포에 반영되지 않음)
  - Production 고정 도메인(`mini-erp-frontend-mu.vercel.app`) 확인 — Redeploy마다 생성되는 랜덤 preview URL과 구분 필요
- [x] `SecurityConfig` CORS 허용 origin에 Vercel 도메인 추가
- [x] Supabase DB에 `app_user` 계정 데이터 이전 (로컬 DB의 BCrypt 해시값을 그대로 복사하여 INSERT)
- [x] 로컬 개발 환경 — IntelliJ Run Configuration에 환경변수 등록 (`DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD`/`JWT_SECRET`)으로 `application.yaml` 환경변수화 이후에도 로컬 실행 가능하도록 유지

### v1.0.0 - 정식 배포_2026.06.17
- [x] Supabase(DB) + Railway(Backend) + Vercel(Frontend) 배포 완료
- [x] 핵심 흐름(발주 → 입고 → 배분 → 판매 → 현재고 → 정산) production 환경에서 전체 동작 확인

> BOM / GWP / 프로모션 연동은 v1.0.0 배포 이후 별도 마이너 버전(v1.x.0)으로 진행 예정.

### v1.0.1 - 핫픽스_2026.06.17
- [x] **`Login.jsx` 로그인 실패 버그 수정** — 다른 모든 페이지는 환경변수 기반 `api`(axios 인스턴스, `src/api/axios.js`)를 사용했지만, `Login.jsx`만 `axios`를 직접 import하여 `http://localhost:8080`을 하드코딩 — production 배포 환경(Vercel)에서 로그인 자체가 항상 localhost로 요청되어 실패하던 문제
  - `Login.jsx`를 공용 `api` 인스턴스로 통일
  - `input`에 `autoComplete` 속성 추가 (브라우저 자격증명 관리자 권한 팝업 관련 개선)
- [x] **CORS 허용 방식을 와일드카드 패턴으로 변경** — Vercel은 Redeploy/Preview마다 서로 다른 임시 URL을 생성하는데, 고정 도메인 하나만 허용 목록에 등록해두면 그 외 URL에서는 매번 CORS preflight가 403으로 막히는 문제 발견
  - `setAllowedOrigins` → `setAllowedOriginPatterns`로 전환, `https://mini-erp-frontend-*.vercel.app` / `https://*-leftdeadman-6379s-projects.vercel.app` 패턴 허용

### v1.0.2 - 핫픽스_2026.07.01
- [x] **`ImageBox` 이미지 URL 하드코딩 수정** — `ui.jsx`의 `ImageBox` 컴포넌트에서 이미지 경로 생성 시 `http://localhost:8080`이 하드코딩되어 production 환경에서 이미지 미리보기가 깨지던 문제
  - `http://localhost:8080${preview}` → `${import.meta.env.VITE_API_BASE_URL || ''}${preview}` 로 변경, `axios.js`와 동일한 환경변수 방식으로 통일

### v1.1.0 - 회원가입 · 대시보드_2026.07.01
- [x] **회원가입 기능 추가**
  - `POST /api/auth/register` 엔드포인트 신규 추가 (`AuthController`)
  - 아이디 중복 시 409, 길이 미달 시 400 응답
  - `AppUser` 생성자 추가 (`@NoArgsConstructor` + 4인자 생성자), 기본 role `USER` 고정
  - `Login.jsx` — 로그인 하단 "회원가입" 링크 + 회원가입 폼 (뒤로가기 버튼, 가입 성공 시 자동 전환)
  - 클라이언트 검증: 빈 값·길이·비밀번호 일치, 서버 409 핸들링
- [x] **대시보드 실DB 연동 활성화**
  - `Dashboard.jsx` 더미 데이터(`ERP_DATA`) 의존 완전 제거
  - 현재고(`GET /api/current-stock`), 매출(`GET /api/sales`), 발주(`GET /api/purchase-orders`) 3개 섹션 실연동
  - `CurrentStockDto` — `productNmKo`, `brandNm`, `warehouseNm`, `storeNm`, `costPrice` 5개 필드 추가
  - `CurrentStockRepository.findAll()` — `product` / `brand` / `warehouse` / `store` LEFT JOIN으로 이름 정보 포함 응답, `findAvailableForSale()`은 기존 유지
  - 로딩 중 shimmer 스켈레톤, API 오류 시 섹션별 에러 메시지, 빈 데이터 상태 처리

### v1.2.0 - 정산 고도화_2026.07.
- [ ] 정산 화면 실DB 연동

### v1.3.0 - 디자인 · 브랜딩_2026.07.
- [ ] 공식 로고 수정

---

## 관련 프로젝트

| 프로젝트 | 설명 | 스택 |
|---------|------|------|
| [SOHOBI](https://github.com/TerryBlackhoodWoo/sohobi) | 상권 분석 플랫폼 | Python, FastAPI, React |
| [VOXScript](https://github.com/TerryBlackhoodWoo/voxscript) | 영상 트랜스크립트 도구 | Python, Electron, OpenAI |

---

## 향후 확장 계획
- 네이버 스마트스토어 API 연동 (온라인 매출 자동 집계)
- 백화점 POS API 연동 (매장별 매출 자동 분류)
- 유통기한 임박 알림 기능
- GWP-BOM 연동 자동 재고 차감
- 외화(USD/JPY) 가격 관리 테이블 추가