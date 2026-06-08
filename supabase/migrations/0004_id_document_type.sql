create type id_document_type as enum (
  'nid',
  'birth_certificate',
  'passport',
  'driving_license',
  'student_id',
  'other'
);

alter table public.nid_documents
  add column document_type id_document_type not null default 'nid';
