--
-- PostgreSQL database dump
--

\restrict c4UQEs2hetzhr3YMfINCgI5hZ9CDQcuAeldXeqUaFZXkltlKiMusnlBSwpb7ht7

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Overtime" DROP CONSTRAINT IF EXISTS "Overtime_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Overtime" DROP CONSTRAINT IF EXISTS "Overtime_attendanceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_incidentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Incident" DROP CONSTRAINT IF EXISTS "Incident_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Incident" DROP CONSTRAINT IF EXISTS "Incident_reviewedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_shiftId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Assignment_userId_date_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Shift" DROP CONSTRAINT IF EXISTS "Shift_pkey";
ALTER TABLE IF EXISTS ONLY public."Overtime" DROP CONSTRAINT IF EXISTS "Overtime_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."Incident" DROP CONSTRAINT IF EXISTS "Incident_pkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_pkey";
ALTER TABLE IF EXISTS ONLY public."Assignment" DROP CONSTRAINT IF EXISTS "Assignment_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Shift";
DROP TABLE IF EXISTS public."Overtime";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."Incident";
DROP TABLE IF EXISTS public."Attendance";
DROP TABLE IF EXISTS public."Assignment";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."IncidentType";
DROP TYPE IF EXISTS public."IncidentStatus";
--
-- Name: IncidentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IncidentStatus" AS ENUM (
    'PENDIENTE',
    'REVISADO',
    'CERRADO'
);


ALTER TYPE public."IncidentStatus" OWNER TO postgres;

--
-- Name: IncidentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IncidentType" AS ENUM (
    'ACCIDENTE',
    'DANO_VEHICULO',
    'FALTA_INSUMO',
    'CONFLICTO',
    'OTRO'
);


ALTER TYPE public."IncidentType" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EMPLOYEE',
    'SUPERVISOR'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "shiftId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date date NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone
);


ALTER TABLE public."Assignment" OWNER TO postgres;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "checkIn" timestamp(3) without time zone NOT NULL,
    "checkOut" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "breakEnd" timestamp(3) without time zone,
    "breakStart" timestamp(3) without time zone
);


ALTER TABLE public."Attendance" OWNER TO postgres;

--
-- Name: Incident; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Incident" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."IncidentType" NOT NULL,
    description text NOT NULL,
    "photoUrl" text,
    status public."IncidentStatus" DEFAULT 'PENDIENTE'::public."IncidentStatus" NOT NULL,
    "adminResponse" text,
    "reviewedById" text,
    "reviewedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Incident" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "incidentId" text,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Overtime; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Overtime" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "attendanceId" text NOT NULL,
    "workedHours" double precision NOT NULL,
    "overtimeHours" double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Overtime" OWNER TO postgres;

--
-- Name: Shift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shift" (
    id text NOT NULL,
    name text NOT NULL,
    "startTime" text,
    "endTime" text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Shift" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'EMPLOYEE'::public."Role" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    phone text,
    "position" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Assignment" (id, "userId", "shiftId", "assignedAt", date, published, "publishedAt") FROM stdin;
3a2dcef7-32b9-4fd5-a301-ce9d06d59135	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:53:23.322	2026-06-15	t	2026-06-16 15:01:33.149
b73e6f0d-6f27-4b78-8340-9363856c6ca1	fe893e3f-c211-42a2-be81-134e591428dd	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:54:54.682	2026-06-15	t	2026-06-16 15:01:33.149
250f3404-733f-46ea-b859-e723097df617	dddb24b1-260a-4b55-a3a2-41d30a0f3992	1cc4bc41-6025-4581-8c5e-f7b39650cb9a	2026-06-16 14:54:58.89	2026-06-15	t	2026-06-16 15:01:33.149
c38c9c8c-2b8e-4391-887d-1931f5cdeaa9	dfa6e35e-68c5-4808-bbf0-e0ceb132dd6f	1cc4bc41-6025-4581-8c5e-f7b39650cb9a	2026-06-16 14:55:03.226	2026-06-15	t	2026-06-16 15:01:33.149
51feb0cb-d4ee-45fd-a840-960c49376d4f	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:09.922	2026-06-16	t	2026-06-16 15:01:33.149
5abb8b19-e703-4e92-bd34-1df0caff605a	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:15.745	2026-06-17	t	2026-06-16 15:01:33.149
184406d1-4dba-49d9-9dd2-9738dbe31da6	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:19.733	2026-06-18	t	2026-06-16 15:01:33.149
594726aa-01b4-4bff-ba23-8fe5c371bd6a	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:26.226	2026-06-19	t	2026-06-16 15:01:33.149
2c75b4d2-bc33-4f9a-84f1-236aab7f93a3	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:30.626	2026-06-20	t	2026-06-16 15:01:33.149
cd33da4e-11e4-43b6-8de7-e022ddd6fb2b	c1cfc0de-be01-409f-87ef-81a76072385c	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 14:55:34.177	2026-06-21	t	2026-06-16 15:01:33.149
a3e72afd-3f71-49e9-a527-0e915470841c	d8593525-a036-4c1b-977f-46c54bda6b0d	05c9b039-3566-455c-9d33-908b97601caa	2026-06-16 15:01:29.564	2026-06-15	t	2026-06-16 15:01:33.149
e04e7b68-2bf9-4bb9-8d37-51e10949f159	fe893e3f-c211-42a2-be81-134e591428dd	05c9b039-3566-455c-9d33-908b97601caa	2026-06-16 15:02:10.188	2026-06-16	t	2026-06-16 15:02:16.817
2cd0ea8c-ab58-4451-ab95-0f2ef6685fbd	fe893e3f-c211-42a2-be81-134e591428dd	ef7cb237-babf-476d-bcf1-c4fdbe69863c	2026-06-16 15:02:15.566	2026-06-17	t	2026-06-16 15:02:16.817
1e436764-08bf-471f-955b-6869fb823642	dddb24b1-260a-4b55-a3a2-41d30a0f3992	05c9b039-3566-455c-9d33-908b97601caa	2026-06-17 02:22:00.935	2026-06-16	t	2026-06-17 02:25:49.969
e6e75c4c-8369-45df-9270-827ad13bb7c3	fe893e3f-c211-42a2-be81-134e591428dd	1cc4bc41-6025-4581-8c5e-f7b39650cb9a	2026-06-17 02:25:14.334	2026-06-18	t	2026-06-17 02:25:49.969
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attendance" (id, "userId", "checkIn", "checkOut", "createdAt", "breakEnd", "breakStart") FROM stdin;
6fb42828-36eb-4806-b4f2-64d5de13e63e	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-16 15:08:52.093	2026-06-16 15:09:14.872	2026-06-16 15:08:52.093	\N	\N
69270e6f-bf6d-4ab9-9a25-36c41dbe4149	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-16 15:09:18.801	2026-06-16 15:09:20.951	2026-06-16 15:09:18.802	\N	\N
eb7b9e6d-71af-45db-85e1-8ee89c4fc58d	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-16 15:59:58.391	2026-06-16 16:00:05.148	2026-06-16 15:59:58.392	\N	\N
71cace76-de4f-461f-9cc4-7e2444246e95	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-16 16:00:06.674	2026-06-16 16:00:09.251	2026-06-16 16:00:06.674	2026-06-16 16:00:08.34	2026-06-16 16:00:07.341
a413e383-f67c-4ea0-bca5-f0a1ff3621df	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-16 16:02:24.214	2026-06-17 02:26:15.407	2026-06-16 16:02:24.215	2026-06-17 02:26:13.956	2026-06-17 02:26:11.782
b7eec2da-d12d-450e-850a-5dbc26500d8f	fe893e3f-c211-42a2-be81-134e591428dd	2026-06-17 02:26:18.283	2026-06-17 02:26:22.32	2026-06-17 02:26:18.284	\N	\N
a430d178-1145-4a42-af65-995309d990cb	dfa6e35e-68c5-4808-bbf0-e0ceb132dd6f	2026-06-17 03:11:57.284	2026-06-17 03:12:04.567	2026-06-17 03:11:57.285	\N	\N
\.


--
-- Data for Name: Incident; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Incident" (id, "userId", type, description, "photoUrl", status, "adminResponse", "reviewedById", "reviewedAt", "createdAt", "updatedAt") FROM stdin;
d41f1b36-24be-403a-8660-d4b426c16fa7	fe893e3f-c211-42a2-be81-134e591428dd	FALTA_INSUMO	Se acabo el desengrasaste 	\N	PENDIENTE	\N	\N	\N	2026-06-17 02:30:09.547	2026-06-17 02:30:09.547
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", "incidentId", title, message, read, "createdAt") FROM stdin;
0e34abc7-dca1-41b2-a511-acd7f8a0e34c	c1cfc0de-be01-409f-87ef-81a76072385c	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-16 15:01:33.185
1f888933-5ab8-4984-8ff2-89d6ab09ac73	fe893e3f-c211-42a2-be81-134e591428dd	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-16 15:01:33.185
8c21bc15-35bd-4668-9b6b-4035d469533c	dddb24b1-260a-4b55-a3a2-41d30a0f3992	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-16 15:01:33.185
a11a8718-a17a-45a8-a781-56a1776af000	fe893e3f-c211-42a2-be81-134e591428dd	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-16 15:02:16.824
a11d1dad-2482-47ce-a21d-f2ecb8b637e8	dddb24b1-260a-4b55-a3a2-41d30a0f3992	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-17 02:25:50.016
d551afe0-b7ec-4e54-a3e8-e0a81e926480	fe893e3f-c211-42a2-be81-134e591428dd	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	f	2026-06-17 02:25:50.016
d2dc226b-60fb-44f3-84a1-c289628df187	c1cfc0de-be01-409f-87ef-81a76072385c	d41f1b36-24be-403a-8660-d4b426c16fa7	Nuevo incidente reportado	Tavo reportó un incidente: FALTA_INSUMO	f	2026-06-17 02:30:09.585
c288d77b-da09-44d7-81cc-1b3daf65ddf2	d8593525-a036-4c1b-977f-46c54bda6b0d	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	t	2026-06-16 15:01:33.185
f81f858d-8bc4-4637-b808-45fc3a5df6ec	dfa6e35e-68c5-4808-bbf0-e0ceb132dd6f	\N	Tu horario fue actualizado	Revisá tu horario del 14/6 al 20/6	t	2026-06-16 15:01:33.185
\.


--
-- Data for Name: Overtime; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Overtime" (id, "userId", "attendanceId", "workedHours", "overtimeHours", date, "createdAt") FROM stdin;
fca9a56d-d620-4a25-9951-737c37bce305	fe893e3f-c211-42a2-be81-134e591428dd	6fb42828-36eb-4806-b4f2-64d5de13e63e	0.0063275	0	2026-06-16 15:08:52.093	2026-06-16 15:09:14.886
3e074de0-9b16-425d-8c33-db9505618ca3	fe893e3f-c211-42a2-be81-134e591428dd	69270e6f-bf6d-4ab9-9a25-36c41dbe4149	0.0005972222222222223	0	2026-06-16 15:09:18.801	2026-06-16 15:09:20.96
b8145ac2-1a80-4d31-b678-076f59e5448d	fe893e3f-c211-42a2-be81-134e591428dd	eb7b9e6d-71af-45db-85e1-8ee89c4fc58d	0.001876944444444444	0	2026-06-16 15:59:58.391	2026-06-16 16:00:05.162
85a5884d-ba0c-4331-b849-a19baeb80940	fe893e3f-c211-42a2-be81-134e591428dd	71cace76-de4f-461f-9cc4-7e2444246e95	0.0007158333333333334	0	2026-06-16 16:00:06.674	2026-06-16 16:00:09.257
1fe5fd73-9ba6-4ef6-90d2-8c4e530044ac	fe893e3f-c211-42a2-be81-134e591428dd	a413e383-f67c-4ea0-bca5-f0a1ff3621df	10.39755361111111	2.39755361111111	2026-06-16 16:02:24.214	2026-06-17 02:26:15.42
6c3a0f0b-372b-48f7-84f8-b26f22e3ee5f	fe893e3f-c211-42a2-be81-134e591428dd	b7eec2da-d12d-450e-850a-5dbc26500d8f	0.001121388888888889	0	2026-06-17 02:26:18.283	2026-06-17 02:26:22.326
52c2f6d0-2ba6-4de4-bca1-3c4cc811c5a4	dfa6e35e-68c5-4808-bbf0-e0ceb132dd6f	a430d178-1145-4a42-af65-995309d990cb	0.002023055555555556	0	2026-06-17 03:11:57.284	2026-06-17 03:12:04.577
\.


--
-- Data for Name: Shift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shift" (id, name, "startTime", "endTime", active, "createdAt", "updatedAt") FROM stdin;
1cc4bc41-6025-4581-8c5e-f7b39650cb9a	Dia Completo	08:00	17:00	t	2026-06-11 00:37:49.674	2026-06-16 14:42:34.444
ef7cb237-babf-476d-bcf1-c4fdbe69863c	Medio Turno (Tarde)	12:00	17:00	t	2026-06-16 13:42:39.001	2026-06-16 14:43:23.188
05c9b039-3566-455c-9d33-908b97601caa	Libre	\N	\N	t	2026-06-16 15:01:17.297	2026-06-16 15:01:17.297
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, active, "createdAt", "updatedAt", phone, "position") FROM stdin;
dfa6e35e-68c5-4808-bbf0-e0ceb132dd6f	Empleado Demo	empleado@test.com	$2b$10$CtEqbxvbobk5.8N7Apgw..YctSQcVpSAUc7W0LEv3j/ncMUMoB1oO	EMPLOYEE	t	2026-06-11 00:16:07.981	2026-06-11 00:16:07.981	0999999999	\N
dddb24b1-260a-4b55-a3a2-41d30a0f3992	Empleado Demo	empleadotest.com	$2b$10$MrXcKh3goUcvrfTqfMGEpOzoi2ecUbs5DCujtXmAiruvqgRMhX3Yy	EMPLOYEE	t	2026-06-11 00:21:28.609	2026-06-11 00:21:28.609	0999999999	\N
d8593525-a036-4c1b-977f-46c54bda6b0d	Administrador	admin@test.com	$2b$10$48zwMYe63tuECaRsaV5AIOL4IPMPK/goq5.lZLEH8FMEyw1dlojSa	ADMIN	t	2026-06-10 19:50:17.6	2026-06-10 19:50:17.6	\N	\N
c1cfc0de-be01-409f-87ef-81a76072385c	Supervisor	supervisor@test.com	$2b$10$xKIAVItxcBG.a38HKpa5EO8VjJACQWpsfNOrCPShwW70.lrOV/mdC	SUPERVISOR	t	2026-06-16 13:33:51.032	2026-06-16 13:33:51.032	\N	Supervisor de turno
fe893e3f-c211-42a2-be81-134e591428dd	Tavo	tavo@gmail.com	$2b$10$I8ddLLcaxJWX27sqIH5Dz.GqdVqM9epE0iz1HMewL/t5TVdxsS1b2	EMPLOYEE	t	2026-06-16 14:26:09.024	2026-06-16 15:02:44.65	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6b11c1b6-2b73-44c7-8e84-c1b84018cbb9	a9c40f4a73b47fcc817713adc598f21e33f30b8736af69b42cd77e6a636f3415	2026-06-10 16:40:50.367995+00	20260610164049_init	\N	\N	2026-06-10 16:40:50.355013+00	1
6dc2a931-120e-4ca4-a794-f96179bea50c	8ee70356833e4a7741af94d851dfc6b4a68a868434ad7b2e2ffc3c18c7acd9a4	2026-06-10 20:49:06.717474+00	20260610204906_employee_fields	\N	\N	2026-06-10 20:49:06.712785+00	1
01419380-3ec5-4c16-b46d-b581d996dd69	584f216059b44445e522405dcc96362887eea8520e24e22737d3fad7d9e2af6c	2026-06-11 00:03:15.254832+00	20260611000314_create_shifts	\N	\N	2026-06-11 00:03:15.241613+00	1
ad6017e3-b977-4534-8546-4c8bb57e504e	ad1a5c89052975637a6fddda61f13dbb5e97945677e8ac5126a61e2365e3221c	2026-06-11 15:16:52.322995+00	20260611151652_create_assignments	\N	\N	2026-06-11 15:16:52.312366+00	1
8e81d45a-f6d2-4d1d-b73e-c9ec3108e9d5	3c74142928b4b8ece72b9348d309ccdad393cc0faad9f0f898d68326578603f7	2026-06-11 16:00:11.081334+00	20260611160010_create_attendances	\N	\N	2026-06-11 16:00:11.072321+00	1
7852bf1d-b63a-466d-8e3f-b347b7a14436	03b9da8ab02e9246b8a9ab63a9119485bb5098db47f0229d7de77a91a3fc5a2c	2026-06-11 16:26:26.919549+00	20260611162626_create_overtime	\N	\N	2026-06-11 16:26:26.910154+00	1
bccaf56d-e8b6-46bc-aa73-482584a16770	065ae26274396a544b157b57c222a058dd67f19c89a9717d2a89d75b9a2ab99a	2026-06-16 06:30:19.404236+00	20260616063018_add_incidents_notifications_supervisor	\N	\N	2026-06-16 06:30:19.386916+00	1
\.


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: Incident Incident_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Incident"
    ADD CONSTRAINT "Incident_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Overtime Overtime_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Overtime"
    ADD CONSTRAINT "Overtime_pkey" PRIMARY KEY (id);


--
-- Name: Shift Shift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shift"
    ADD CONSTRAINT "Shift_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Assignment_userId_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Assignment_userId_date_key" ON public."Assignment" USING btree ("userId", date);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Assignment Assignment_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public."Shift"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Incident Incident_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Incident"
    ADD CONSTRAINT "Incident_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Incident Incident_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Incident"
    ADD CONSTRAINT "Incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_incidentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES public."Incident"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Overtime Overtime_attendanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Overtime"
    ADD CONSTRAINT "Overtime_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES public."Attendance"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Overtime Overtime_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Overtime"
    ADD CONSTRAINT "Overtime_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict c4UQEs2hetzhr3YMfINCgI5hZ9CDQcuAeldXeqUaFZXkltlKiMusnlBSwpb7ht7

