# OPD frontend API

How the OPD visit works, and the exact request/response shapes the frontend should use.

Base URL: `/api/v1/`

Encounter-scoped clinical path used throughout:

```
{base} = /api/v1/clinical/visits/{visit_uuid}/encounters/{encounter_uuid}
```

Example IDs used in every payload below:

| Thing | UUID |
|---|---|
| Visit | `7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111` |
| Encounter | `a3b8c1d2-e4f5-4678-90ab-cdef12345678` |
| Customer | `11111111-2222-3333-4444-555555555555` |
| Clinic | `22222222-3333-4444-5555-666666666666` |
| OPD department | `33333333-4444-5555-6666-777777777777` |
| Consultation service | `44444444-5555-6666-7777-888888888888` |
| Location | `55555555-6666-7777-8888-999999999999` |
| Product (Amoxicillin) | `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee` |
| Product (CBC) | `bbbbbbbb-cccc-dddd-eeee-ffffffffffff` |

---

## 1. Conventions

### Auth

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

Clinical endpoints require the user to be in the **Clinical** group. Writes also require a role capability (see §4). Diagnoses catalog/search is authenticated but does not require the Clinical group.

### Envelope

Every JSON response except `204 No Content` is wrapped:

```json
{
  "success": true,
  "message": "",
  "data": {},
  "meta": { "request_id": "c0ffee00-1111-2222-3333-444444444444" },
  "errors": []
}
```

| HTTP | `success` | `data` | `errors` |
|---|---|---|---|
| 200 / 201 | `true` | object or array | `[]` |
| 400 / 403 / 404 | `false` | `null` | `[{code, field, message}]` |
| 204 | no body at all | — | — |

Paginated list endpoints (rare on clinical OPD; visits list can paginate) put results in `data` and pagination in `meta.pagination`:

```json
{
  "success": true,
  "message": "",
  "data": [ ],
  "meta": {
    "request_id": "…",
    "pagination": {
      "count": 120,
      "next": "https://host/api/v1/visits/?page=2",
      "previous": null
    }
  },
  "errors": []
}
```

Clinical OPD lists in this doc are **not paginated**. `data` is the array itself.

### Error example

```json
{
  "success": false,
  "message": "Encounter is no longer active.",
  "data": null,
  "meta": { "request_id": "c0ffee00-1111-2222-3333-444444444444" },
  "errors": [
    {
      "code": "invalid",
      "field": "detail",
      "message": "Encounter is no longer active."
    }
  ]
}
```

| Status | When |
|---|---|
| `400` | Validation, encounter locked, appointment slot conflict, immutable chart |
| `403` | Not in Clinical group, or missing capability |
| `404` | Encounter / note / HPI / disposition missing |
| `204` | DELETE chief complaint or HPI |

Capability denial:

```json
{
  "success": false,
  "message": "Capability record_vitals is required.",
  "data": null,
  "meta": { "request_id": "…" },
  "errors": [
    {
      "code": "permission_denied",
      "field": "detail",
      "message": "Capability record_vitals is required."
    }
  ]
}
```

### Types

- UUIDs are strings.
- Datetimes are ISO-8601 with offset, e.g. `"2026-09-18T10:15:00+02:00"`.
- Dates are `"YYYY-MM-DD"`.
- Decimals (`numeric_value`, `quantity`, `unit_price`, …) are **strings** (`"36.8000"`, `"1.00"`).
- Integer FKs (`tenant`, `customer`, `product`, `created_by`, `sales_order`) are numbers. Prefer `*_uuid` fields when present.
- Empty strings and `null` are both used. Do not coerce `null` to `""` for UUID fields.

---

## 2. Visit-day flow

```mermaid
flowchart LR
  register[POST /visits/] --> waiting[status waiting queue_stage registered]
  waiting --> nurse[POST observations or nursing-notes]
  nurse --> triaged[triaged_at set still waiting queue_stage triaged]
  triaged --> doctor[First physician write]
  doctor --> inProgress[status in_progress queue_stage with_clinician]
  inProgress --> disposition[PUT disposition optional]
  inProgress --> complete[POST /visits/{uuid}/end/]
  complete --> amend[POST notes amend]
```

1. Front desk `POST /api/v1/visits/`. First OPD encounter is `waiting` / `queue_stage=registered`. Visit `status` is `active`.
2. Nurse records vitals and/or a nursing note. Encounter **stays `waiting`**. `triaged_at` is set. Queue becomes `triaged`.
3. Doctor opens `GET {base}/chart-summary/`. First physician write (CC, HPI, exam, clinical note, Rx, orders, diagnoses, problem list, current meds, disposition) starts the encounter → `in_progress` / `with_clinician`.
4. Optional `PUT {base}/disposition/`. `follow_up` + `follow_up_at` books an appointment. Visit end does **not** require disposition.
5. `POST /api/v1/visits/{visit_uuid}/end/` completes encounters that have progress (including vitals-only) and cancels untouched waiting encounters.
6. After complete, chart writes are locked. Notes can be amended with `{body, amendment_reason}`.

### Encounter `status` vs queue `queue_stage`

Do **not** add a `triaged` encounter status. Persist only `waiting | in_progress | completed | cancelled`.

| Condition | Encounter `status` | Queue `queue_stage` |
|---|---|---|
| Cancelled | `cancelled` | `cancelled` |
| Completed | `completed` | `completed` |
| Doctor started | `in_progress` | `with_clinician` |
| Waiting + `triaged_at` set | `waiting` | `triaged` |
| Waiting, no triage | `waiting` | `registered` |

Visit `status`: `pending | active | completed | cancelled`.

Nurse writes must **not** flip the row to `in_progress`. That is how the nurse station stays on the queue.

---

## 3. Screen map

| Screen | Endpoints |
|---|---|
| Register | `POST /visits/` |
| Queue boards | `GET /clinical/opd/queue/?queue_stage=` |
| Chart header / safety | `GET {base}/chart-summary/` |
| Vitals | observation-definitions + observations |
| Nursing | nursing-notes |
| Allergies | allergies (+ banner from chart-summary) |
| CC / HPI | chief-complaints, nested hpi, history |
| Exam | physical-exams |
| Notes | clinical-notes |
| Diagnoses | diagnoses + catalog search |
| Problem list | problem-list |
| Meds | prescriptions + current-medications |
| Orders | orders; investigations from chart-summary |
| Activity | timeline |
| Prior visits | clinical-history, history-summary |
| Disposition | disposition |
| Close visit | `POST /visits/{uuid}/end/` |

---

## 4. Capabilities

### `GET /api/v1/clinical/my-capabilities/`

**200**

```json
{
  "success": true,
  "message": "",
  "data": {
    "capabilities": [
      "record_vitals",
      "record_nursing_note",
      "record_physical_exam",
      "record_clinical_note",
      "record_chief_complaint",
      "record_hpi",
      "prescribe",
      "order_laboratory",
      "order_radiology",
      "order_procedure",
      "order_sundry",
      "order_medication",
      "manage_diagnoses",
      "manage_problem_list",
      "manage_current_medications",
      "record_allergy",
      "record_disposition",
      "view_vital_signs_tab",
      "view_physical_examination_tab",
      "view_orders_tab",
      "view_diagnoses_tab",
      "view_medications_tab",
      "view_activity_tab",
      "view_client_tab"
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

Hide tabs / disable writes when the string is missing.

| Capability | UI |
|---|---|
| `record_vitals` | Vitals |
| `record_nursing_note` | Nursing notes |
| `record_physical_exam` | Physical exam |
| `record_clinical_note` | Clinical notes |
| `record_chief_complaint` | Chief complaint |
| `record_hpi` | HPI |
| `prescribe` | Prescriptions |
| `order_laboratory` / `order_radiology` / `order_procedure` / `order_sundry` / `order_medication` | Orders by type |
| `manage_diagnoses` | Encounter diagnoses |
| `manage_problem_list` | Problem list |
| `manage_current_medications` | Current meds |
| `record_allergy` | Clinical allergy write |
| `record_disposition` | Disposition |
| `view_*_tab` | Show/hide workspace tabs |

### Tenant admin: role capabilities

`GET /api/v1/clinical/role-capabilities/`

**200**

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "uuid": "c1111111-1111-1111-1111-111111111111",
      "user_role": "nurse",
      "capability": "record_vitals"
    },
    {
      "uuid": "c2222222-2222-2222-2222-222222222222",
      "user_role": "physician",
      "capability": "prescribe"
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`PATCH /api/v1/clinical/role-capabilities/`

`user_role`: `nurse | physician | pharmacist | billing | housekeeping | admin | other`

```json
[
  { "user_role": "nurse", "capability": "prescribe", "enabled": false },
  { "user_role": "physician", "capability": "record_vitals", "enabled": true }
]
```

Response is the same list as GET (active rows only).

---

## 5. Register the visit

### `POST /api/v1/visits/`

Walk-in. Creates visit + first encounter.

**Request**

```json
{
  "customer": "11111111-2222-3333-4444-555555555555",
  "department": "33333333-4444-5555-6666-777777777777",
  "clinic": "22222222-3333-4444-5555-666666666666",
  "consultation_service": "44444444-5555-6666-7777-888888888888",
  "location": "55555555-6666-7777-8888-999999999999",
  "clinician": null,
  "visit_date": "2026-09-18T08:00:00+02:00",
  "mode_of_payment": "cash",
  "insurance_scheme": null,
  "requires_pre_authorization": false,
  "pre_authorization_number": "",
  "pre_authorization_comments": "",
  "encounter_notes": "",
  "is_walk_in": true
}
```

Required: `customer`, `department`.  
`mode_of_payment`: `cash | insurance`. If `insurance`, send `insurance_scheme` (customer-insurance UUID).  
`clinician` is a **user integer PK**, not a UUID.

**201** — visit object plus `created_encounter`. `encounters` is also nested.

```json
{
  "success": true,
  "message": "",
  "data": {
    "id": 901,
    "uuid": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
    "appointment": null,
    "consultation_service": "44444444-5555-6666-7777-888888888888",
    "consultation_service_name": "General OPD",
    "customer": "11111111-2222-3333-4444-555555555555",
    "customer_name": "Jane Banda",
    "customer_identifier": "SIG-000123",
    "customer_age": 34,
    "customer_gender": "female",
    "visit_date": "2026-09-18T08:00:00+02:00",
    "openmrs_visit_uuid": null,
    "status": "active",
    "mark_for_completion": false,
    "mode_of_payment": "cash",
    "insurance_scheme": null,
    "insurance_scheme_name": null,
    "insurance_company_name": null,
    "linked_sales_order_state": null,
    "can_edit_mode_of_payment": true,
    "mode_of_payment_edit_block_reason": null,
    "can_reopen_visit": false,
    "reopen_block_reason": null,
    "requires_pre_authorization": false,
    "pre_authorization_number": "",
    "pre_authorization_comments": "",
    "is_walk_in": true,
    "is_active": true,
    "clinic": "22222222-3333-4444-5555-666666666666",
    "clinic_name": "SIGMA Clinic",
    "closed_by": null,
    "created_by": 12,
    "created_by_name": "Front Desk",
    "encounters": [
      {
        "id": 501,
        "uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
        "visit": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
        "department": "33333333-4444-5555-6666-777777777777",
        "department_name": "Outpatient",
        "department_type": "opd",
        "location": "55555555-6666-7777-8888-999999999999",
        "location_name": "OPD Room 1",
        "clinician": null,
        "clinician_name": null,
        "status": "waiting",
        "billing_mode": "shared_visit",
        "started_at": null,
        "ended_at": null,
        "notes": "",
        "is_active": true,
        "created_by": 12,
        "created_at": "2026-09-18T08:00:01+02:00",
        "updated_at": "2026-09-18T08:00:01+02:00"
      }
    ],
    "member_benefits": null,
    "created_at": "2026-09-18T08:00:01+02:00",
    "updated_at": "2026-09-18T08:00:01+02:00",
    "created_encounter": {
      "id": 501,
      "uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
      "visit": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
      "department": "33333333-4444-5555-6666-777777777777",
      "department_name": "Outpatient",
      "department_type": "opd",
      "location": "55555555-6666-7777-8888-999999999999",
      "location_name": "OPD Room 1",
      "clinician": null,
      "clinician_name": null,
      "status": "waiting",
      "billing_mode": "shared_visit",
      "started_at": null,
      "ended_at": null,
      "notes": "",
      "is_active": true,
      "created_by": 12,
      "created_at": "2026-09-18T08:00:01+02:00",
      "updated_at": "2026-09-18T08:00:01+02:00"
    }
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`VisitEncounterSerializer` does **not** include `triaged_at` or `queue_stage`. Read those from the OPD queue.

`billing_mode`: `shared_visit | separate_department`.  
`department_type` for OPD is `opd`.

### `POST /api/v1/visits/from-appointment/{appointment_uuid}/`

**Request**

```json
{
  "consultation_service": "44444444-5555-6666-7777-888888888888",
  "mode_of_payment": "cash",
  "insurance_scheme": null
}
```

**201** if a new visit was created, **200** if one already existed. Same visit payload as create, including `created_encounter` when an encounter was produced.

### `GET /api/v1/visits/{visit_uuid}/`

**200** — same visit object as create, without `created_encounter`.

### `POST /api/v1/visits/{visit_uuid}/end/`

No body. Completes encounters with progress (vitals count). Cancels untouched waiting encounters. Does **not** require disposition.

**200** — visit with `status: "completed"` and encounters `completed` or `cancelled`.

### `POST /api/v1/visits/{visit_uuid}/reopen/`

No body. **200** visit with `status: "active"` when `can_reopen_visit` is true.

### Encounter lifecycle (usually unused)

Physician charting auto-starts. Manual:

| Method | Path | Body |
|---|---|---|
| `POST` | `/api/v1/visits/{visit_uuid}/encounters/` | `{department, location?, clinician?, notes?, billing_mode?}` **201** |
| `POST` | `/api/v1/visits/{visit_uuid}/encounters/{encounter_uuid}/start/` | none **200** `status: "in_progress"`, `started_at` set |
| `POST` | `…/complete/` | none **200** |
| `POST` | `…/cancel/` | none **200** |
| `POST` | `…/billing-mode/` | `{billing_mode}` **200** |

---

## 6. OPD queue

### `GET /api/v1/clinical/opd/queue/`

Query:

| Param | Values | Notes |
|---|---|---|
| `queue_stage` | `registered \| triaged \| with_clinician \| completed \| cancelled` | Preferred board filter |
| `status` | `waiting \| in_progress \| completed \| cancelled` | Encounter status |
| `clinic_uuid` | UUID | |
| `search` | name / identifier | |
| `limit` | int, default `50` | |

Suggested boards: `queue_stage=registered` (front desk / nurse), `queue_stage=triaged` (ready for doctor), `queue_stage=with_clinician`.

**200** after nurse vitals:

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "encounter_uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
      "visit_uuid": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
      "visit_status": "active",
      "customer_uuid": "11111111-2222-3333-4444-555555555555",
      "customer_name": "Jane Banda",
      "customer_identifier": "SIG-000123",
      "clinic_name": "SIGMA Clinic",
      "department_name": "Outpatient",
      "status": "waiting",
      "queue_stage": "triaged",
      "triaged_at": "2026-09-18T08:12:00+02:00",
      "waiting_minutes": 14,
      "started_at": null,
      "mode_of_payment": "cash",
      "insurance_scheme_name": null,
      "latest_vitals": [
        {
          "code": "temperature",
          "name": "Temperature",
          "numeric_value": "36.8000",
          "text_value": "",
          "unit": "C"
        },
        {
          "code": "bp_systolic",
          "name": "Blood pressure (systolic)",
          "numeric_value": "128.0000",
          "text_value": "",
          "unit": "mmHg"
        },
        {
          "code": "pulse",
          "name": "Pulse",
          "numeric_value": "78.0000",
          "text_value": "",
          "unit": "bpm"
        }
      ],
      "allergy_count": 1,
      "highest_allergy_severity": "severe"
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`highest_allergy_severity`: `mild | moderate | severe | life_threatening | null`.  
`latest_vitals` is this encounter’s active observations (not “latest of each code” across visits).  
`waiting_minutes` is an integer.

Before triage, `queue_stage` is `"registered"`, `triaged_at` is `null`, `latest_vitals` is `[]`.

---

## 7. Open the chart

### `GET {base}/chart-summary/`

Call once on chart load. **200**

```json
{
  "success": true,
  "message": "",
  "data": {
    "allergies": [
      {
        "uuid": "d0d0d0d0-1111-2222-3333-444444444444",
        "allergy_name": "Penicillin",
        "allergy_type": "medication",
        "severity": "severe",
        "reaction": "Anaphylaxis"
      }
    ],
    "this_encounter_vitals": [
      {
        "uuid": "0b0b0b0b-1111-2222-3333-444444444444",
        "definition_code": "temperature",
        "definition_name": "Temperature",
        "numeric_value": "36.8000",
        "text_value": "",
        "unit": "C",
        "recorded_at": "2026-09-18T08:12:00+02:00",
        "recorded_by_name": "Nurse Phiri"
      }
    ],
    "last_vitals": [
      {
        "uuid": "0c0c0c0c-1111-2222-3333-444444444444",
        "definition_code": "temperature",
        "definition_name": "Temperature",
        "numeric_value": "37.1000",
        "text_value": "",
        "unit": "C",
        "recorded_at": "2026-08-02T09:04:00+02:00",
        "recorded_by_name": "Nurse Phiri"
      }
    ],
    "last_chief_complaints": [
      {
        "uuid": "cc111111-1111-2222-3333-444444444444",
        "text": "Cough for 3 days",
        "recorded_at": "2026-08-02T09:20:00+02:00",
        "recorded_by_name": "Dr Kamanga",
        "has_hpi": true
      }
    ],
    "last_hpis": [
      {
        "uuid": "hpi11111-1111-2222-3333-444444444444",
        "chief_complaint_uuid": "cc111111-1111-2222-3333-444444444444",
        "body": "Dry cough, worse at night. No fever.",
        "recorded_at": "2026-08-02T09:22:00+02:00",
        "recorded_by_name": "Dr Kamanga"
      }
    ],
    "last_encounter_uuid": "99999999-aaaa-bbbb-cccc-dddddddddddd",
    "open_orders": [
      {
        "id": 7001,
        "uuid": "ord11111-1111-2222-3333-444444444444",
        "tenant": 1,
        "visit": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
        "encounter": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
        "customer": 88,
        "customer_name": "Jane Banda",
        "customer_identifier": "SIG-000123",
        "clinic": 3,
        "clinic_name": "SIGMA Clinic",
        "consultation_service": 4,
        "consultation_service_name": "General OPD",
        "item_type": "PROCEDURE",
        "item_type_display": "Procedure",
        "source": "CLINICAL",
        "source_display": "Clinical",
        "status": "ORDERED",
        "status_display": "Ordered",
        "reconciliation_status": "PENDING",
        "reconciliation_status_display": "Pending",
        "description": "Wound dressing",
        "quantity": "1.00",
        "clinical_quantity": "1.00",
        "clinical_uom": "",
        "charge_quantity": "1.00",
        "unit_price": "5000.00",
        "currency": "MWK",
        "product": 401,
        "product_uuid": "cccccccc-dddd-eeee-ffff-000000000000",
        "pricelist": 9,
        "sales_order": 1201,
        "sales_order_line": 3301,
        "ordered_at": "2026-09-18T09:40:00+02:00",
        "cancelled_at": null,
        "cancelled_by": null,
        "metadata": {},
        "is_active": true,
        "created_at": "2026-09-18T09:40:00+02:00",
        "updated_at": "2026-09-18T09:40:00+02:00",
        "created_by": 15,
        "created_by_name": "Dr Kamanga"
      }
    ],
    "investigation_orders": [
      {
        "id": 6990,
        "uuid": "lab11111-1111-2222-3333-444444444444",
        "tenant": 1,
        "visit": "6aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "encounter": "6bbbbbbb-cccc-dddd-eeee-ffffffffffff",
        "customer": 88,
        "customer_name": "Jane Banda",
        "customer_identifier": "SIG-000123",
        "clinic": 3,
        "clinic_name": "SIGMA Clinic",
        "consultation_service": 4,
        "consultation_service_name": "General OPD",
        "item_type": "LABORATORY",
        "item_type_display": "Laboratory",
        "source": "CLINICAL",
        "source_display": "Clinical",
        "status": "COMPLETED",
        "status_display": "Completed",
        "reconciliation_status": "MATCHED",
        "reconciliation_status_display": "Matched",
        "description": "Full blood count",
        "quantity": "1.00",
        "clinical_quantity": "1.00",
        "clinical_uom": "",
        "charge_quantity": "1.00",
        "unit_price": "15000.00",
        "currency": "MWK",
        "product": 220,
        "product_uuid": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
        "pricelist": 9,
        "sales_order": 1188,
        "sales_order_line": 3200,
        "ordered_at": "2026-08-02T09:30:00+02:00",
        "cancelled_at": null,
        "cancelled_by": null,
        "metadata": {
          "result_summary": "WBC 11.2, Hb 12.1"
        },
        "is_active": true,
        "created_at": "2026-08-02T09:30:00+02:00",
        "updated_at": "2026-08-02T11:10:00+02:00",
        "created_by": 15,
        "created_by_name": "Dr Kamanga"
      }
    ],
    "problem_list": [
      {
        "uuid": "prb11111-1111-2222-3333-444444444444",
        "code": "I10",
        "standard": "ICD10",
        "description": "Essential (primary) hypertension",
        "status": "active",
        "notes": "On amlodipine",
        "recorded_at": "2026-03-01T10:00:00+02:00",
        "resolved_at": null,
        "recorded_by_name": "Dr Kamanga",
        "source_diagnosis_uuid": "dx111111-1111-2222-3333-444444444444"
      }
    ],
    "current_medications": [
      {
        "uuid": "med11111-1111-2222-3333-444444444444",
        "product_uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "name": "Amlodipine 5mg",
        "dose": "5 mg",
        "route": "PO",
        "frequency": "OD",
        "instructions": "In the morning",
        "status": "active",
        "started_at": "2026-03-01T10:05:00+02:00",
        "stopped_at": null,
        "notes": "",
        "recorded_by_name": "Dr Kamanga"
      }
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

| Key | Scope | Notes |
|---|---|---|
| `allergies` | Client, active only | Banner. Shorter than GET `/allergies/` (no `notes`, `date_identified`, `verified_by_doctor`, `is_active`) |
| `this_encounter_vitals` | This encounter | |
| `last_*` | Previous encounter for this client | Empty arrays / `last_encounter_uuid: null` if first visit |
| `open_orders` | This **visit**, non-cancelled, **excluding LABORATORY** | |
| `investigation_orders` | This **client**, lab + radiology, newest 20, non-cancelled | Results live only in `status` + `metadata` |
| `problem_list` / `current_medications` | Client | Persist across visits |

First visit empty shape:

```json
{
  "allergies": [],
  "this_encounter_vitals": [],
  "last_vitals": [],
  "last_chief_complaints": [],
  "last_hpis": [],
  "last_encounter_uuid": null,
  "open_orders": [],
  "investigation_orders": [],
  "problem_list": [],
  "current_medications": []
}
```

Visit-order `item_type`: `CONSULTATION | TREATMENT | MEDICATION | SUPPLY | LABORATORY | RADIOLOGY | PROCEDURE | SUNDRY | OTHER`  
`source`: `VISIT_START | CLINICAL | MANUAL | RECONCILIATION`  
`status`: `DRAFT | ORDERED | IN_PROGRESS | COMPLETED | CANCELLED`  
`reconciliation_status`: `PENDING | MATCHED | MISMATCH`

### `GET {base}/timeline/`

**200** — array, newest first.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "type": "observation",
      "occurred_at": "2026-09-18T08:12:00+02:00",
      "summary": "Temperature: 36.8000",
      "actor": "Nurse Phiri",
      "object_uuid": "0b0b0b0b-1111-2222-3333-444444444444"
    },
    {
      "type": "encounter_status",
      "occurred_at": "2026-09-18T08:00:01+02:00",
      "summary": "Encounter status: waiting",
      "actor": null,
      "object_uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678"
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`type` values you will see: `observation`, `nursing_note`, `clinical_note`, `physical_exam`, `chief_complaint`, `hpi`, `disposition`, `problem`, `current_medication`, `allergy`, `order`, `order_cancelled`, `prescription`, `diagnosis`, `visit_started`, `encounter_status`, `clinical_activity`.

### `GET {base}/history-summary/`

Last 10 encounters for this client **at this clinic**.

```json
{
  "success": true,
  "message": "",
  "data": {
    "recent_encounters": [
      {
        "encounter_uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
        "visit_uuid": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
        "department": "Outpatient",
        "status": "waiting",
        "started_at": null
      },
      {
        "encounter_uuid": "99999999-aaaa-bbbb-cccc-dddddddddddd",
        "visit_uuid": "6aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "department": "Outpatient",
        "status": "completed",
        "started_at": "2026-08-02T09:18:00+02:00"
      }
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

### `GET {base}/clinical-history/`

Query: `history_encounter_uuid` (optional). Default selected visit is the previous encounter.

**200**

```json
{
  "success": true,
  "message": "",
  "data": {
    "visits": [
      {
        "visit_uuid": "6aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        "encounter_uuid": "99999999-aaaa-bbbb-cccc-dddddddddddd",
        "visit_date": "2026-08-02T08:50:00+02:00",
        "department": "Outpatient",
        "status": "completed",
        "started_at": "2026-08-02T09:18:00+02:00",
        "ended_at": "2026-08-02T10:05:00+02:00"
      }
    ],
    "selected_visit_uuid": "6aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "selected_encounter_uuid": "99999999-aaaa-bbbb-cccc-dddddddddddd",
    "notes": [
      {
        "kind": "clinical_note",
        "uuid": "note1111-1111-2222-3333-444444444444",
        "title": "Clinical note",
        "body": "URTI. Advised fluids.",
        "occurred_at": "2026-08-02T09:40:00+02:00",
        "recorded_by_name": "Dr Kamanga"
      },
      {
        "kind": "chief_complaint",
        "uuid": "cc111111-1111-2222-3333-444444444444",
        "title": "Chief complaint",
        "body": "Cough for 3 days",
        "occurred_at": "2026-08-02T09:20:00+02:00",
        "recorded_by_name": "Dr Kamanga"
      }
    ],
    "orders": [],
    "diagnoses": [],
    "medications": [],
    "chief_complaints": [
      {
        "uuid": "cc111111-1111-2222-3333-444444444444",
        "text": "Cough for 3 days",
        "recorded_at": "2026-08-02T09:20:00+02:00",
        "recorded_by_name": "Dr Kamanga",
        "has_hpi": true,
        "hpi": {
          "uuid": "hpi11111-1111-2222-3333-444444444444",
          "chief_complaint_uuid": "cc111111-1111-2222-3333-444444444444",
          "body": "Dry cough, worse at night. No fever.",
          "recorded_at": "2026-08-02T09:22:00+02:00",
          "recorded_by_name": "Dr Kamanga"
        }
      }
    ],
    "hpis": [
      {
        "uuid": "hpi11111-1111-2222-3333-444444444444",
        "chief_complaint_uuid": "cc111111-1111-2222-3333-444444444444",
        "body": "Dry cough, worse at night. No fever.",
        "recorded_at": "2026-08-02T09:22:00+02:00",
        "recorded_by_name": "Dr Kamanga"
      }
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`notes[].kind`: `physical_exam | clinical_note | nursing_note | chief_complaint | hpi`.  
No previous visits: `visits: []`, `selected_*_uuid: null`, empty arrays.

---

## 8. Nurse station

Does **not** start the encounter.

### Observation definitions

`GET /api/v1/clinical/observation-definitions/`

Seeded system vitals (`tenant` null, `is_system` true — `is_system` is **not** in the serializer):

**200**

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "uuid": "def00001-1111-2222-3333-444444444444",
      "code": "temperature",
      "name": "Temperature",
      "category": "vital",
      "value_type": "decimal",
      "default_unit": "C",
      "display_order": 10
    },
    {
      "uuid": "def00002-1111-2222-3333-444444444444",
      "code": "bp_systolic",
      "name": "Blood pressure (systolic)",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "mmHg",
      "display_order": 20
    },
    {
      "uuid": "def00003-1111-2222-3333-444444444444",
      "code": "bp_diastolic",
      "name": "Blood pressure (diastolic)",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "mmHg",
      "display_order": 30
    },
    {
      "uuid": "def00004-1111-2222-3333-444444444444",
      "code": "pulse",
      "name": "Pulse",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "bpm",
      "display_order": 40
    },
    {
      "uuid": "def00005-1111-2222-3333-444444444444",
      "code": "respiratory_rate",
      "name": "Respiratory rate",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "breaths/min",
      "display_order": 50
    },
    {
      "uuid": "def00006-1111-2222-3333-444444444444",
      "code": "spo2",
      "name": "SpO2",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "%",
      "display_order": 60
    },
    {
      "uuid": "def00007-1111-2222-3333-444444444444",
      "code": "weight",
      "name": "Weight",
      "category": "vital",
      "value_type": "decimal",
      "default_unit": "kg",
      "display_order": 70
    },
    {
      "uuid": "def00008-1111-2222-3333-444444444444",
      "code": "height",
      "name": "Height",
      "category": "vital",
      "value_type": "decimal",
      "default_unit": "cm",
      "display_order": 80
    },
    {
      "uuid": "def00009-1111-2222-3333-444444444444",
      "code": "bmi",
      "name": "BMI",
      "category": "vital",
      "value_type": "decimal",
      "default_unit": "kg/m2",
      "display_order": 90
    },
    {
      "uuid": "def00010-1111-2222-3333-444444444444",
      "code": "blood_glucose",
      "name": "Blood glucose",
      "category": "vital",
      "value_type": "decimal",
      "default_unit": "mg/dL",
      "display_order": 100
    },
    {
      "uuid": "def00011-1111-2222-3333-444444444444",
      "code": "pain_score",
      "name": "Pain score",
      "category": "vital",
      "value_type": "integer",
      "default_unit": "",
      "display_order": 110
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`category`: `vital | other`. `value_type`: `decimal | integer | text`.  
If both `weight` and `height` are posted, the API may auto-create/update a `bmi` observation. Do not POST BMI yourself unless you intend to override.

### Vitals

`GET {base}/observations/` — **200** array of observation objects (same shape as create).

`POST {base}/observations/` — capability `record_vitals`. First vitals write sets `triaged_at`.

**Request**

```json
{
  "definition_uuid": "def00001-1111-2222-3333-444444444444",
  "numeric_value": "36.8",
  "text_value": "",
  "unit": "C"
}
```

Use `text_value` when `value_type` is `text`. `numeric_value` may be `null`.

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "0b0b0b0b-1111-2222-3333-444444444444",
    "definition_code": "temperature",
    "definition_name": "Temperature",
    "numeric_value": "36.8000",
    "text_value": "",
    "unit": "C",
    "recorded_at": "2026-09-18T08:12:00+02:00",
    "recorded_by_name": "Nurse Phiri"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

### Nursing notes

`GET {base}/nursing-notes/` — **200** array.

`POST {base}/nursing-notes/` — `{ "body": "Alert, GCS 15. Waiting for doctor." }`

Create **is** the signature (`signed_at` / `signed_by_name` set). Also sets `triaged_at` if not already set.

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "nn111111-1111-2222-3333-444444444444",
    "body": "Alert, GCS 15. Waiting for doctor.",
    "recorded_at": "2026-09-18T08:13:00+02:00",
    "recorded_by_name": "Nurse Phiri",
    "signed_at": "2026-09-18T08:13:00+02:00",
    "signed_by_name": "Nurse Phiri",
    "amendment_of_uuid": null,
    "amendment_reason": ""
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`POST {base}/nursing-notes/{note_uuid}/amend/` — only after encounter **completed**.

```json
{
  "body": "Alert, GCS 15. Clarified: no chest pain.",
  "amendment_reason": "Added chest-pain denial"
}
```

**201** — new row, original unchanged:

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "nn222222-1111-2222-3333-444444444444",
    "body": "Alert, GCS 15. Clarified: no chest pain.",
    "recorded_at": "2026-09-18T11:02:00+02:00",
    "recorded_by_name": "Nurse Phiri",
    "signed_at": "2026-09-18T11:02:00+02:00",
    "signed_by_name": "Nurse Phiri",
    "amendment_of_uuid": "nn111111-1111-2222-3333-444444444444",
    "amendment_reason": "Added chest-pain denial"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

Open-encounter create stays GET/POST only (no PATCH).

### Allergies (clinical write)

Same `CustomerAllergy` table as dental. Clinical write does **not** start the consult. Physician records set `verified_by_doctor=true`.

`GET {base}/allergies/` — **200**

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "uuid": "d0d0d0d0-1111-2222-3333-444444444444",
      "allergy_name": "Penicillin",
      "allergy_type": "medication",
      "severity": "severe",
      "reaction": "Anaphylaxis",
      "notes": "Documented 2024",
      "date_identified": "2024-02-11",
      "verified_by_doctor": true,
      "is_active": true
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`POST {base}/allergies/` — capability `record_allergy`

```json
{
  "allergy_name": "Penicillin",
  "allergy_type": "medication",
  "severity": "severe",
  "reaction": "Anaphylaxis",
  "notes": "Documented 2024",
  "date_identified": "2024-02-11"
}
```

**201** — same object as list item.

`allergy_type`: `medication | latex | anesthetic | metal | food | environmental | other`  
`severity`: `mild | moderate | severe | life_threatening`

Unique on `(customer, allergy_name)`. Re-POST of the same name updates rather than duplicating (do not assume a new UUID).

`PATCH {base}/allergies/{allergy_uuid}/`

```json
{
  "severity": "life_threatening",
  "is_active": true
}
```

**200** — full allergy object. Set `is_active: false` to deactivate (banner drops it).

Dental still works: `/api/v1/customer-allergies/`.

Allergy matches on prescribe / **MEDICATION** orders are **alerts, never 400s**. Lab create does not run the matcher.

---

## 9. Consultation (doctor)

These writes start `waiting` → `in_progress` (except allergies / vitals / nursing notes).

### Chief complaint

`GET {base}/chief-complaints/` — **200** array.

`POST {base}/chief-complaints/` — `{ "text": "Headache for 2 days" }`

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "cc222222-1111-2222-3333-444444444444",
    "text": "Headache for 2 days",
    "recorded_at": "2026-09-18T09:05:00+02:00",
    "recorded_by_name": "Dr Kamanga",
    "has_hpi": false
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`PATCH {base}/chief-complaints/{complaint_uuid}/` — `{ "text": "Frontal headache for 2 days" }` **200** same shape, `has_hpi` unchanged.

`DELETE {base}/chief-complaints/{complaint_uuid}/` — **204** empty. Cascades HPI.

`GET {base}/chief-complaints/suggestions/`

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "text": "Headache for 2 days",
      "last_recorded_at": "2026-09-18T09:05:00+02:00",
      "occurrence_count": 3
    }
  ],
  "meta": { "request_id": "…" },
  "errors": []
}
```

`GET {base}/chief-complaints/history/` — same visit-picker shape as clinical-history, but only `visits`, `selected_visit_uuid`, `selected_encounter_uuid`, `chief_complaints` (with nested `hpi`).

### HPI (one per chief complaint)

`GET {base}/chief-complaints/{complaint_uuid}/hpi/` — **200** or **404** `{detail: "HPI not found."}`

`POST` / `PATCH` — `{ "body": "Gradual onset, photophobia, no neck stiffness." }`

POST **201**, PATCH **200**:

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "hpi22222-1111-2222-3333-444444444444",
    "chief_complaint_uuid": "cc222222-1111-2222-3333-444444444444",
    "body": "Gradual onset, photophobia, no neck stiffness.",
    "recorded_at": "2026-09-18T09:07:00+02:00",
    "recorded_by_name": "Dr Kamanga"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

Second POST for the same complaint is **400**. Use PATCH.  
`DELETE` — **204**.  
`GET {base}/hpi/history/` — visit picker + `hpis` array (no nested complaint).

Keep PATCH while the encounter is open. Locked after complete.

### Physical exam

`GET {base}/physical-exams/` — **200** array.

`POST {base}/physical-exams/`

```json
{
  "section": "general",
  "system_code": "",
  "findings": "Alert, no distress. HEENT: no lymphadenopathy."
}
```

`section`: `general | system | free_text` (default `general`).

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "pe111111-1111-2222-3333-444444444444",
    "section": "general",
    "system_code": "",
    "findings": "Alert, no distress. HEENT: no lymphadenopathy.",
    "recorded_at": "2026-09-18T09:10:00+02:00",
    "recorded_by_name": "Dr Kamanga"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`PATCH {base}/physical-exams/{exam_uuid}/` — same write fields, **200**.

### Clinical notes

`GET {base}/clinical-notes/` — **200** array.

`POST {base}/clinical-notes/` — `{ "body": "Viral URTI. Conservative management." }`

Create = signature.

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "cn111111-1111-2222-3333-444444444444",
    "body": "Viral URTI. Conservative management.",
    "recorded_at": "2026-09-18T09:25:00+02:00",
    "recorded_by_name": "Dr Kamanga",
    "signed_at": "2026-09-18T09:25:00+02:00",
    "signed_by_name": "Dr Kamanga",
    "amendment_of_uuid": null,
    "amendment_reason": ""
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`POST {base}/clinical-notes/{note_uuid}/amend/` after complete — same as nursing amend. **201** new row with `amendment_of_uuid` pointing at the original.

### Diagnoses (this encounter)

Not the problem list.

`GET /api/v1/clinical/diagnosis-catalog/search/?q=hypert&standard=ICD10`

`q` min length 2. `standard` default `ICD10` (`ICD10 | ICD11`). Max 25 hits.

**200**

```json
{
  "success": true,
  "message": "",
  "data": {
    "results": [
      {
        "code": "I10",
        "description": "Essential (primary) hypertension",
        "standard": "ICD10",
        "source": "local_db"
      }
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`GET {base}/diagnoses/` — **200** array.

`POST {base}/diagnoses/`

```json
{
  "code": "I10",
  "description": "Essential (primary) hypertension",
  "standard": "ICD10",
  "status": "provisional",
  "source": "local_db",
  "source_platform": "CLINICAL",
  "is_primary": true
}
```

Defaults if omitted: `standard=ICD10`, `status=provisional`, `source=manual`, `source_platform=CLINICAL`, `is_primary=false`.  
Code is stored **uppercase**.

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "dx222222-1111-2222-3333-444444444444",
    "encounter_uuid": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
    "visit_uuid": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
    "code": "I10",
    "standard": "ICD10",
    "description": "Essential (primary) hypertension",
    "status": "provisional",
    "source": "local_db",
    "source_platform": "CLINICAL",
    "is_primary": true,
    "is_active": true,
    "created_at": "2026-09-18T09:20:00+02:00",
    "updated_at": "2026-09-18T09:20:00+02:00"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`status`: `provisional | final`  
`source`: `manual | who_api | local_db`  
`source_platform`: `CLINICAL | INVOICE`

`PATCH /api/v1/clinical/diagnoses/{diagnosis_uuid}/` — partial, **200** same object.  
`DELETE /api/v1/clinical/diagnoses/{diagnosis_uuid}/` — **204**.

### Problem list (client-scoped)

URL is encounter-scoped; rows belong to the **customer**.

`GET {base}/problem-list/` — **200** array of problem objects.

`POST {base}/problem-list/`

```json
{
  "description": "Essential (primary) hypertension",
  "code": "I10",
  "standard": "ICD10",
  "notes": "On amlodipine",
  "source_diagnosis_uuid": "dx222222-1111-2222-3333-444444444444"
}
```

`source_diagnosis_uuid` copies code/description from **this** encounter’s diagnosis; the diagnosis row is unchanged. One **active** problem per `(customer, code)` when `code` is set.

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "prb22222-1111-2222-3333-444444444444",
    "code": "I10",
    "standard": "ICD10",
    "description": "Essential (primary) hypertension",
    "status": "active",
    "notes": "On amlodipine",
    "recorded_at": "2026-09-18T09:21:00+02:00",
    "resolved_at": null,
    "recorded_by_name": "Dr Kamanga",
    "source_diagnosis_uuid": "dx222222-1111-2222-3333-444444444444"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`PATCH {base}/problem-list/{problem_uuid}/`

```json
{ "status": "resolved", "notes": "BP controlled, stopped follow-up" }
```

**200** — `status: "resolved"`, `resolved_at` set.  
`status`: `active | resolved | inactive`.

### Current medications (client-scoped)

`GET {base}/current-medications/` — **200** array.

`POST {base}/current-medications/`

```json
{
  "product_uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "name": "Amlodipine 5mg",
  "dose": "5 mg",
  "route": "PO",
  "frequency": "OD",
  "instructions": "In the morning",
  "notes": ""
}
```

Need either `name` or `product_uuid` (name is filled from the product if omitted).

**201**

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "med22222-1111-2222-3333-444444444444",
    "product_uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "name": "Amlodipine 5mg",
    "dose": "5 mg",
    "route": "PO",
    "frequency": "OD",
    "instructions": "In the morning",
    "status": "active",
    "started_at": "2026-09-18T09:22:00+02:00",
    "stopped_at": null,
    "notes": "",
    "recorded_by_name": "Dr Kamanga"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

`PATCH {base}/current-medications/{medication_uuid}/` — `{ "status": "stopped" }` **200**, `stopped_at` set.  
`status`: `active | stopped`.

Finalizing a prescription **upserts** an active current-med. Cancelling the Rx does **not** stop it.

### Prescriptions

`GET {base}/prescriptions/` — **200** array.

`POST {base}/prescriptions/`

```json
{
  "product_uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "dose": "500 mg",
  "route": "PO",
  "frequency": "TDS",
  "duration": "5 days",
  "quantity": "15",
  "clinical_quantity": "15",
  "clinical_uom": "tablet",
  "charge_quantity": "1",
  "instructions": "After food",
  "is_prn": false,
  "clinical_notes": ""
}
```

Create starts as `draft`. `visit_order_uuid` is `null` until finalize.

**201** (with allergy alert — **still 201**, never 400)

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "rx111111-1111-2222-3333-444444444444",
    "product_uuid": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "product_name": "Amoxicillin 500mg",
    "dose": "500 mg",
    "route": "PO",
    "frequency": "TDS",
    "duration": "5 days",
    "quantity": "15.00",
    "clinical_uom": "tablet",
    "charge_quantity": "1.00",
    "instructions": "After food",
    "is_prn": false,
    "clinical_notes": "",
    "status": "draft",
    "visit_order_uuid": null,
    "prescribed_by_name": "Dr Kamanga",
    "allergy_alerts": [
      {
        "allergy_name": "Penicillin",
        "severity": "severe",
        "match": "Penicillin"
      }
    ]
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

Show `allergy_alerts` as warnings. Empty list if no match. Matcher: case-insensitive substring between product name and medication/anesthetic allergies.

`POST {base}/prescriptions/{prescription_uuid}/finalize/` — no body. **200**, `status: "ordered"`, `visit_order_uuid` set, current-med upserted.

`POST {base}/prescriptions/{prescription_uuid}/cancel/` — no body. **200**, `status: "cancelled"`. Current-med stays active.

`status`: `draft | ordered | cancelled`.

### Orders

`GET {base}/orders/` — **200** array of visit-order objects **plus** `allergy_alerts` (always present; `[]` unless `item_type` is `MEDICATION`).

`POST {base}/orders/`

```json
{
  "item_type": "LABORATORY",
  "product_uuid": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
  "description": "Full blood count",
  "quantity": "1",
  "clinical_quantity": "1",
  "clinical_uom": "",
  "charge_quantity": "1"
}
```

`item_type` for clinical create: `LABORATORY | RADIOLOGY | PROCEDURE | SUNDRY | MEDICATION | SUPPLY`.

**201** — same as `VisitOrderSerializer` plus `allergy_alerts`.

```json
{
  "success": true,
  "message": "",
  "data": {
    "id": 7100,
    "uuid": "ord22222-1111-2222-3333-444444444444",
    "tenant": 1,
    "visit": "7c1e4a2b-9f10-4c3d-8a21-0b9e6d4f1111",
    "encounter": "a3b8c1d2-e4f5-4678-90ab-cdef12345678",
    "customer": 88,
    "customer_name": "Jane Banda",
    "customer_identifier": "SIG-000123",
    "clinic": 3,
    "clinic_name": "SIGMA Clinic",
    "consultation_service": 4,
    "consultation_service_name": "General OPD",
    "item_type": "LABORATORY",
    "item_type_display": "Laboratory",
    "source": "CLINICAL",
    "source_display": "Clinical",
    "status": "ORDERED",
    "status_display": "Ordered",
    "reconciliation_status": "PENDING",
    "reconciliation_status_display": "Pending",
    "description": "Full blood count",
    "quantity": "1.00",
    "clinical_quantity": "1.00",
    "clinical_uom": "",
    "charge_quantity": "1.00",
    "unit_price": "15000.00",
    "currency": "MWK",
    "product": 220,
    "product_uuid": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
    "pricelist": 9,
    "sales_order": 1202,
    "sales_order_line": 3310,
    "ordered_at": "2026-09-18T09:30:00+02:00",
    "cancelled_at": null,
    "cancelled_by": null,
    "metadata": {},
    "is_active": true,
    "created_at": "2026-09-18T09:30:00+02:00",
    "updated_at": "2026-09-18T09:30:00+02:00",
    "created_by": 15,
    "created_by_name": "Dr Kamanga",
    "allergy_alerts": []
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

There is **no** lab result ingest on this API. Show pending/resulted lab/rad from chart-summary `investigation_orders` (`status` + `metadata`).

`POST {base}/orders/{order_uuid}/cancel/` — no body. **200** same object with `status: "CANCELLED"`, `cancelled_at` set.

---

## 10. Disposition (optional)

`GET {base}/disposition/`

**200** if present, **404** if none:

```json
{
  "success": false,
  "message": "Disposition not found.",
  "data": null,
  "meta": { "request_id": "…" },
  "errors": [
    {
      "code": "not_found",
      "field": "detail",
      "message": "Disposition not found."
    }
  ]
}
```

`PUT {base}/disposition/` — upsert. **200**.

```json
{
  "outcome": "follow_up",
  "follow_up_at": "2026-09-25T09:00:00+02:00",
  "notes": "Review BP",
  "referral_destination": ""
}
```

`outcome`: `discharged | follow_up | referred | admitted | other`

**200** when follow-up books:

```json
{
  "success": true,
  "message": "",
  "data": {
    "uuid": "disp1111-1111-2222-3333-444444444444",
    "outcome": "follow_up",
    "follow_up_at": "2026-09-25T09:00:00+02:00",
    "notes": "Review BP",
    "referral_destination": "",
    "recorded_at": "2026-09-18T09:50:00+02:00",
    "recorded_by_name": "Dr Kamanga",
    "follow_up_appointment_uuid": "appt1111-1111-2222-3333-444444444444"
  },
  "meta": { "request_id": "…" },
  "errors": []
}
```

If `outcome=follow_up` and `follow_up_at` is set, the API books an appointment using the department’s default duration. Slot conflicts return **400**; disposition is **not** saved — pick another time.

```json
{
  "success": false,
  "message": "That time slot is not available.",
  "data": null,
  "meta": { "request_id": "…" },
  "errors": [
    {
      "code": "invalid",
      "field": "detail",
      "message": "That time slot is not available."
    }
  ]
}
```

Re-PUT with a new time updates a non-terminal linked appointment. Other outcomes do not book (`follow_up_appointment_uuid: null`).

Discharge example:

```json
{
  "outcome": "discharged",
  "follow_up_at": null,
  "notes": "Home, return if worse",
  "referral_destination": ""
}
```

Visit `/end/` does not require disposition.

---

## 11. After complete

Open-encounter PATCH/POST for charting returns **400** (`Encounter is no longer active.`).

Allowed:

- `POST {base}/clinical-notes/{note_uuid}/amend/`
- `POST {base}/nursing-notes/{note_uuid}/amend/`

Body: `{ "body": "…", "amendment_reason": "…" }`. New row; original unchanged. **201**.

Amending while still open, or without `amendment_reason`, is **400**.

---

## 12. Endpoint index

All `{base}` = `/api/v1/clinical/visits/{visit_uuid}/encounters/{encounter_uuid}`.

| Method | Path | Status | `data` |
|---|---|---|---|
| GET | `/clinical/my-capabilities/` | 200 | `{capabilities: string[]}` |
| GET / PATCH | `/clinical/role-capabilities/` | 200 | capability rows |
| POST | `/visits/` | 201 | visit + `created_encounter` |
| POST | `/visits/from-appointment/{appointment_uuid}/` | 201/200 | visit |
| GET | `/visits/{visit_uuid}/` | 200 | visit |
| POST | `/visits/{visit_uuid}/end/` | 200 | visit |
| POST | `/visits/{visit_uuid}/reopen/` | 200 | visit |
| POST | `/visits/{visit_uuid}/encounters/{encounter_uuid}/start/` | 200 | encounter |
| GET | `/clinical/opd/queue/` | 200 | queue row[] |
| GET | `/clinical/observation-definitions/` | 200 | definition[] |
| GET / POST | `{base}/observations/` | 200 / 201 | observation[] / observation |
| GET / POST | `{base}/nursing-notes/` | 200 / 201 | note[] / note |
| POST | `{base}/nursing-notes/{note_uuid}/amend/` | 201 | note |
| GET / POST | `{base}/allergies/` | 200 / 201 | allergy[] / allergy |
| PATCH | `{base}/allergies/{allergy_uuid}/` | 200 | allergy |
| GET | `{base}/chart-summary/` | 200 | chart object |
| GET | `{base}/timeline/` | 200 | event[] |
| GET | `{base}/history-summary/` | 200 | `{recent_encounters}` |
| GET | `{base}/clinical-history/` | 200 | history object |
| GET / POST | `{base}/chief-complaints/` | 200 / 201 | complaint[] / complaint |
| GET | `{base}/chief-complaints/suggestions/` | 200 | suggestion[] |
| GET | `{base}/chief-complaints/history/` | 200 | history slice |
| PATCH / DELETE | `{base}/chief-complaints/{complaint_uuid}/` | 200 / 204 | complaint / empty |
| GET/POST/PATCH/DELETE | `{base}/chief-complaints/{complaint_uuid}/hpi/` | 200/201/200/204 | hpi |
| GET | `{base}/hpi/history/` | 200 | history slice |
| GET / POST | `{base}/physical-exams/` | 200 / 201 | exam[] / exam |
| PATCH | `{base}/physical-exams/{exam_uuid}/` | 200 | exam |
| GET / POST | `{base}/clinical-notes/` | 200 / 201 | note[] / note |
| POST | `{base}/clinical-notes/{note_uuid}/amend/` | 201 | note |
| GET | `/clinical/diagnosis-catalog/search/` | 200 | `{results}` |
| GET / POST | `{base}/diagnoses/` | 200 / 201 | diagnosis[] / diagnosis |
| PATCH / DELETE | `/clinical/diagnoses/{diagnosis_uuid}/` | 200 / 204 | diagnosis / empty |
| GET / POST | `{base}/problem-list/` | 200 / 201 | problem[] / problem |
| PATCH | `{base}/problem-list/{problem_uuid}/` | 200 | problem |
| GET / POST | `{base}/current-medications/` | 200 / 201 | med[] / med |
| PATCH | `{base}/current-medications/{medication_uuid}/` | 200 | med |
| GET / POST | `{base}/prescriptions/` | 200 / 201 | rx[] / rx |
| POST | `{base}/prescriptions/{prescription_uuid}/finalize/` | 200 | rx |
| POST | `{base}/prescriptions/{prescription_uuid}/cancel/` | 200 | rx |
| GET / POST | `{base}/orders/` | 200 / 201 | order[] / order |
| POST | `{base}/orders/{order_uuid}/cancel/` | 200 | order |
| GET / PUT | `{base}/disposition/` | 200 (GET 404 if none) | disposition |

---

## 13. Frontend rules that will break the product if ignored

1. Do not treat `triaged` as an encounter status. Filter the queue with `queue_stage`.
2. Vitals/nursing notes staying `waiting` is correct.
3. `allergy_alerts` are warnings only. Never block submit on them.
4. Do not require disposition before `/end/`.
5. Lab **results** are not a separate clinical API. Show `investigation_orders` (`status`, `metadata`).
6. Problem list and current meds are **client** records, even though the URL is encounter-scoped.
7. Amend only after the encounter is completed; create is the signature for notes.
8. Read `data` inside the envelope. `204` has no envelope.
9. Visit encounter objects from `/visits/` do not include `queue_stage` or `triaged_at` — those live on the queue.
10. Decimal fields come back as strings.