-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2025 at 10:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `applicant_id` int(11) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`applicant_id`, `fname`, `lname`, `email`, `phone`, `sex`, `created_at`, `updated_at`, `user_id`) VALUES
(2, 'John', 'Doe', 'johndoe@gmail.com', '123-456-7890', 'male', '2025-07-12 16:11:07', '2025-07-12 16:11:07', NULL),
(4, 'John', 'Doe', 'nathaytamrat50@gmail.com', '123-456-7890', 'male', '2025-07-12 18:59:08', '2025-07-12 18:59:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `approvalhierarchy`
--

CREATE TABLE `approvalhierarchy` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `next_role_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflow`
--

CREATE TABLE `approvalworkflow` (
  `approvalworkflow_id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved','Declined') DEFAULT 'Pending',
  `comment` text DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `report_id` int(11) DEFAULT NULL,
  `report_status` enum('Pending','Approved','Declined') DEFAULT 'Pending',
  `rating` decimal(5,2) DEFAULT NULL,
  `comment_writer` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalworkflow`
--

INSERT INTO `approvalworkflow` (`approvalworkflow_id`, `plan_id`, `approver_id`, `status`, `comment`, `approval_date`, `approved_at`, `report_id`, `report_status`, `rating`, `comment_writer`) VALUES
(2, 16, 58, 'Declined', NULL, '2025-01-21 11:15:13', NULL, NULL, 'Pending', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `Date` date DEFAULT NULL,
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `conversation_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `name`) VALUES
(1, 'ሃዋሳ አዲሱ መናሃሪያ'),
(2, 'ሃዋሳ አሮጌ መናሃሪያ'),
(3, 'ዳዬ መናሃሪያ'),
(4, 'ወንዶ መናሃሪያ'),
(5, 'ይርጋለም መናሃሪያ'),
(6, 'ቦና መናሃሪያ');

-- --------------------------------------------------------

--
-- Table structure for table `employeeleave`
--

CREATE TABLE `employeeleave` (
  `LeaveID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `LeaveTypeID` int(11) DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `ApproverID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `fname` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `dateOfJoining` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `profileImage` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `name`, `role_id`, `department_id`, `supervisor_id`, `fname`, `lname`, `email`, `phone`, `sex`, `position`, `dateOfJoining`, `status`, `profileImage`) VALUES
(21, 'www www', 1, 1, NULL, 'hayal', 'tamrat', NULL, '0916048977', NULL, NULL, NULL, 'Active', NULL),
(34, 'hayaltame', NULL, 2, 21, 'ggg', 'ggg', 'beki@gmail.com', '0934556621', 'F', NULL, NULL, 'Active', NULL),
(36, 'hayaltame', NULL, 2, 0, 'some', 'one', 'bekeei@gmail.com', '0934556621', 'M', NULL, NULL, 'Active', NULL),
(37, 'hayaltame111', 1, NULL, NULL, 'some11', 'tame', 'oneq@gmail.com', '0934556688', 'M', NULL, NULL, 'Active', NULL),
(38, 'hayaltame3333', 1, NULL, NULL, 'aaa', 'a', 'one1a111@gmail.com', '0934556111', 'M', NULL, NULL, 'Active', NULL),
(39, 'hayaltame1114444', 1, NULL, NULL, 'some00', 'one11', 'one222@gmail.com', '0934556688', 'M', NULL, NULL, 'Active', NULL),
(40, 'hayaltame1114444444', 1, NULL, NULL, 'yeab444', 'one4444', 'beki444@gmail.com', '0934556444', 'M', NULL, NULL, 'Active', NULL),
(41, 'hayaltame444', 1, NULL, NULL, 'yeabeee', 'eeee', 'eeeee@gmail.com', '0934556644', 'M', NULL, NULL, 'Active', NULL),
(43, 'rtttttt44', 1, 1, NULL, 'yeabeee', 'eeee', 'eeee44e@gmail.com', '0934556677', 'M', NULL, NULL, 'Active', NULL),
(45, 'tttttttttttt111', 1, NULL, NULL, 'yeabrrr', 'tamer', 'onerrr@gmail.com', '0934556655', 'M', NULL, NULL, 'Active', NULL),
(46, 'bekele woya', 8, NULL, NULL, 'bekele', 'woya', 'woya@gmail.com', '0933499094', 'M', NULL, NULL, 'Active', NULL),
(47, 'admin admin', 1, 2, 1, 'admin', 'admin', 'admin@email.com', '123-456-7890', 'M', NULL, NULL, 'Active', NULL),
(48, 'hylt', 8, 1, 0, 'hl', 'tm', 'hl@gmail.com', '0934556644', 'M', NULL, NULL, 'Active', NULL),
(49, 'yonas', 2, NULL, NULL, 'yonas', 'ceo', 'yonas@itp.org', '0933499093', 'M', NULL, NULL, 'Active', NULL),
(50, 'simegn', 5, 2, 49, 'geter', 'geter', 'simegn@itp.org', '0933499094', 'M', NULL, NULL, 'Active', NULL),
(51, 'hayal@itp.org', 8, 2, 50, 'hayal', 'hayal', 'hayal@itp.org', '0933499097', 'M', NULL, NULL, 'Active', NULL),
(54, 'hayalt@itp.org', 8, 2, 0, 'hayalt', 'hayalt', 'hayalt@itp.org', '0933499097', 'M', NULL, NULL, 'Active', NULL),
(55, 'abebe', 4, NULL, 0, 'abebe', 'abe', 'abe@itp.et', '0934556624', 'M', NULL, NULL, 'Active', NULL),
(56, '333333333', 4, 2, 49, 'some00333333', 'one333333', 'beki33333333333@gmail.com', '0934556333', 'M', NULL, NULL, 'Active', NULL),
(57, 'staf', 8, 2, 56, 'staf', 'staf', 'staf@gmail.com', '0934556688', 'M', NULL, NULL, 'Active', NULL),
(58, 'nebyat', 6, 2, 50, 'nebyat', 'nebyat', 'nebyat@itp.et', '093455444', 'F', NULL, NULL, 'Active', NULL),
(59, 'ewunetu', 7, 2, 58, 'ewunetu', 'ewunetu', 'ewunetu@itp.et', '0934556453', 'M', NULL, NULL, 'Active', NULL),
(60, 'general', 3, NULL, 49, 'general', 'manager', 'manager@itp.et', '0933499366', 'M', NULL, NULL, 'Active', NULL),
(62, 'staf1', 8, 2, 66, 'staf1', 'staf1', 'staf1@itp.et', '0934556688', 'M', NULL, NULL, 'Active', NULL),
(63, 'hayalta4444', 6, 2, 50, 'some', 'one', 'berrrrrki@gmail.com', '0934556555', 'M', NULL, NULL, 'Active', NULL),
(64, 'yeabeeeee', 1, NULL, NULL, 'some', 'one', 'eeee@gmail.com', '0934556688', 'M', NULL, NULL, 'Active', NULL),
(65, 'team leader', 7, 2, 58, 'teaml', 'teaml', 'teaml@gmail.com', '09373773333', 'M', NULL, NULL, 'Active', NULL),
(66, 'team leader', 7, 2, 58, 'teamleader', 'teamleader', 'teamleader@gmail.com', '09373773333', 'M', NULL, NULL, 'Active', NULL),
(67, 'hayal', 1, NULL, NULL, 'hayal', 'tamrat', 'hayal@itp.it', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(68, 'hayal', 8, 2, 65, 'hayal', 'tamrat', 'hayalt@itp.it', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(69, 'registrar@gmail.com', 5, NULL, NULL, 'registrar', 'registrar', 'registrar@gmail.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(70, 'Nathan', 1, NULL, NULL, 'Hayal', 'Girum', 'nathan@itp.et', '0976180462', 'M', NULL, NULL, 'Active', NULL),
(71, 'Hayal Tamrat Girum', 3, NULL, NULL, 'Hayal', 'Girum', 'hayal@gmai.com', '0976180462', 'M', NULL, NULL, 'Active', NULL),
(72, 'nathay tamrat', 5, NULL, 70, 'hayal', 'tamrat', 'regist@bus.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(73, 'hayal tamrat', 1, NULL, NULL, 'nathay', 'tamrat', 'astu@nathayblog.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(75, 'hayal tamrat', 4, NULL, 70, 'nathay', 'tamrat', 'hager@temechain.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(78, 'hayal tamrat', 4, NULL, 70, 'nathay', 'tamrat', 'hager1@temechain.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(82, 'hayal tamrat', 4, 1, 49, 'hayal', 'tamrat', 'hager22@temechain.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(83, 'Hayal Tamrat', 5, NULL, NULL, 'Hayal', 'Tamrat', 'Hayalt@hu.edu.et', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(84, 'Hayal ', 1, NULL, NULL, 'Nathay ', 'Nathay ', 'Nathantamrat50@gmail.com', '90188837377', 'M', NULL, NULL, 'Active', NULL),
(85, 'nathay tamrat', 5, NULL, NULL, 'nathay', 'tamrat', 'astu@nathayblog.et', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(86, 'agent', 6, NULL, 50, 'agent', 'agent', 'agent@lonche.com', 'itp@123', 'M', NULL, NULL, 'Active', NULL),
(89, 'Yeamlak Tamrat', 4, NULL, NULL, 'Yeamlak', 'Tamrat', 'casher@lonche.com', '0916048977', 'F', NULL, NULL, 'Active', NULL),
(90, 'Liyu Tamrat', 7, 1, NULL, 'super', 'user', 'superuser@lonche.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(91, 'trafik', 2, 1, NULL, 'menarya', 'trafik', 'menarya@lonche.com', '0988883388', 'M', NULL, NULL, 'Active', NULL),
(92, 'manager@lonche', 3, 1, NULL, 'manager1', 'manager', 'manager@loche.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(94, 'Hayal Tmrat Girum', 3, 1, NULL, 'owner', 'Tamrat', 'kidoastu1993@gmail.com', '0916048977', 'M', NULL, NULL, 'Active', NULL),
(95, 'tsegi', 7, 1, NULL, 'tsega', 'gosaye', 'tsegagosaye17@gmail.com', '0909090909', 'F', NULL, NULL, 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employeetraining`
--

CREATE TABLE `employeetraining` (
  `EmployeeTrainingID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `TrainingID` int(11) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hiring_decisions`
--

CREATE TABLE `hiring_decisions` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `decision` enum('hired','rejected','on_hold') NOT NULL,
  `employment_start_date` date DEFAULT NULL,
  `salary_confirmed` decimal(10,2) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `decided_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interviews`
--

CREATE TABLE `interviews` (
  `id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `interview_type` enum('phone','video','in_person','technical','panel') DEFAULT 'in_person',
  `location` varchar(255) DEFAULT NULL,
  `interviewer_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interview_evaluations`
--

CREATE TABLE `interview_evaluations` (
  `id` int(11) NOT NULL,
  `interview_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `technical_skills` int(11) DEFAULT NULL CHECK (`technical_skills` >= 1 and `technical_skills` <= 10),
  `communication_skills` int(11) DEFAULT NULL CHECK (`communication_skills` >= 1 and `communication_skills` <= 10),
  `problem_solving` int(11) DEFAULT NULL CHECK (`problem_solving` >= 1 and `problem_solving` <= 10),
  `cultural_fit` int(11) DEFAULT NULL CHECK (`cultural_fit` >= 1 and `cultural_fit` <= 10),
  `overall_rating` int(11) DEFAULT NULL CHECK (`overall_rating` >= 1 and `overall_rating` <= 10),
  `strengths` text DEFAULT NULL,
  `weaknesses` text DEFAULT NULL,
  `recommendation` enum('hire','do_not_hire','consider','strong_hire') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobapplication`
--

CREATE TABLE `jobapplication` (
  `ApplicationID` int(11) NOT NULL,
  `CandidateName` varchar(100) NOT NULL,
  `PositionID` int(11) DEFAULT NULL,
  `ApplicationDate` date DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobposition`
--

CREATE TABLE `jobposition` (
  `PositionID` int(11) NOT NULL,
  `PositionTitle` varchar(100) NOT NULL,
  `DepartmentID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `vacancy_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `cv_path` varchar(500) DEFAULT NULL,
  `expected_salary` decimal(10,2) DEFAULT NULL,
  `availability_date` date DEFAULT NULL,
  `status` enum('pending','reviewed','shortlisted','interview_scheduled','interviewed','offer_sent','hired','rejected','on_hold') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_vacancies`
--

CREATE TABLE `job_vacancies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `responsibilities` text DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `employment_type` enum('full_time','part_time','contract','internship') DEFAULT 'full_time',
  `experience_level` enum('entry','mid','senior','executive') DEFAULT 'mid',
  `education_required` varchar(255) DEFAULT NULL,
  `skills_required` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('active','inactive','closed') DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_vacancies`
--

INSERT INTO `job_vacancies` (`id`, `title`, `department`, `description`, `requirements`, `responsibilities`, `salary_range`, `location`, `employment_type`, `experience_level`, `education_required`, `skills_required`, `deadline`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'markating', 'Marketing', 'marketing ', 'marketing ', 'marketing ', '32000', 'Addis Ababa', 'contract', 'mid', 'Msc', 'marketing ', '2025-07-24', 'active', 18, '2025-07-12 13:54:46', '2025-07-12 19:13:16'),
(2, 'software development', 'Engineering', 'hayal ', 'node js', 'development', '50000', 'AA', 'full_time', 'mid', 'Msc', 'react', '2025-07-25', 'active', 21, '2025-07-12 19:04:59', '2025-07-12 19:05:31');

-- --------------------------------------------------------

--
-- Table structure for table `leavetype`
--

CREATE TABLE `leavetype` (
  `LeaveTypeID` int(11) NOT NULL,
  `LeaveTypeName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attempt_time` datetime DEFAULT NULL,
  `success` tinyint(1) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `user_id`, `attempt_time`, `success`, `ip_address`, `browser`, `location`) VALUES
(1, 35, '2025-06-25 17:01:28', 1, '127.0.0.1', NULL, NULL),
(2, 35, '2025-06-25 17:03:31', 0, '127.0.0.1', NULL, NULL),
(3, 35, '2025-06-25 17:03:35', 0, '127.0.0.1', NULL, NULL),
(4, 34, '2025-06-25 17:03:57', 1, '127.0.0.1', NULL, NULL),
(5, 34, '2025-06-25 17:15:33', 0, '127.0.0.1', NULL, NULL),
(6, 34, '2025-06-25 17:15:39', 1, '127.0.0.1', NULL, NULL),
(7, 34, '2025-06-25 17:17:30', 0, '127.0.0.1', NULL, NULL),
(8, 34, '2025-06-25 17:17:43', 0, '127.0.0.1', NULL, NULL),
(9, 34, '2025-06-25 17:17:45', 1, '127.0.0.1', NULL, NULL),
(10, 34, '2025-06-25 17:18:07', 0, '127.0.0.1', NULL, NULL),
(11, 34, '2025-06-25 17:18:12', 1, '127.0.0.1', NULL, NULL),
(12, 36, '2025-06-25 17:22:39', 1, '127.0.0.1', NULL, NULL),
(13, 34, '2025-06-25 17:22:52', 0, '127.0.0.1', NULL, NULL),
(14, 36, '2025-06-25 17:23:03', 1, '127.0.0.1', NULL, NULL),
(15, 36, '2025-06-25 17:23:09', 0, '127.0.0.1', NULL, NULL),
(16, 34, '2025-06-25 17:26:04', 0, '127.0.0.1', NULL, NULL),
(17, 36, '2025-06-25 17:27:30', 0, '127.0.0.1', NULL, NULL),
(18, 34, '2025-06-25 17:28:57', 0, '127.0.0.1', NULL, NULL),
(19, 36, '2025-06-25 17:33:16', 0, '127.0.0.1', NULL, NULL),
(20, 36, '2025-06-25 17:33:24', 1, '127.0.0.1', NULL, NULL),
(21, 36, '2025-06-25 17:33:32', 0, '127.0.0.1', NULL, NULL),
(22, 36, '2025-06-25 17:42:39', 0, '127.0.0.1', NULL, NULL),
(23, 36, '2025-06-25 17:47:01', 0, '127.0.0.1', NULL, NULL),
(24, 36, '2025-06-25 17:47:08', 0, '127.0.0.1', NULL, NULL),
(25, 36, '2025-06-25 17:47:16', 1, '127.0.0.1', NULL, NULL),
(26, 35, '2025-06-25 17:47:49', 0, '127.0.0.1', NULL, NULL),
(27, 35, '2025-06-25 17:48:03', 0, '127.0.0.1', NULL, NULL),
(28, 35, '2025-06-25 17:48:12', 0, '127.0.0.1', NULL, NULL),
(29, 35, '2025-06-25 17:48:25', 0, '127.0.0.1', NULL, NULL),
(30, 35, '2025-06-25 17:48:39', 0, '127.0.0.1', NULL, NULL),
(31, 36, '2025-06-25 17:48:44', 0, '127.0.0.1', NULL, NULL),
(32, 36, '2025-06-25 17:48:48', 0, '127.0.0.1', NULL, NULL),
(33, 34, '2025-06-25 17:49:44', 1, '127.0.0.1', NULL, NULL),
(34, 36, '2025-06-25 17:50:16', 1, '127.0.0.1', NULL, NULL),
(35, 36, '2025-06-25 17:50:51', 1, '127.0.0.1', NULL, NULL),
(36, 36, '2025-06-25 17:50:59', 0, '127.0.0.1', NULL, NULL),
(37, 36, '2025-06-25 17:51:02', 0, '127.0.0.1', NULL, NULL),
(38, 36, '2025-06-25 17:51:05', 0, '127.0.0.1', NULL, NULL),
(39, 36, '2025-06-25 17:51:08', 0, '127.0.0.1', NULL, NULL),
(40, 36, '2025-06-25 17:51:11', 0, '127.0.0.1', NULL, NULL),
(41, 36, '2025-06-25 17:51:53', 0, '127.0.0.1', NULL, NULL),
(42, 36, '2025-06-25 17:51:56', 0, '127.0.0.1', NULL, NULL),
(43, 36, '2025-06-25 17:52:04', 0, '127.0.0.1', NULL, NULL),
(44, 34, '2025-06-25 17:52:13', 1, '127.0.0.1', NULL, NULL),
(45, 36, '2025-06-25 17:52:27', 0, '127.0.0.1', NULL, NULL),
(46, 34, '2025-06-25 17:52:29', 1, '127.0.0.1', NULL, NULL),
(47, 36, '2025-06-25 18:04:17', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(48, 3, '2025-06-25 18:04:52', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(49, 36, '2025-06-25 18:34:53', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(50, 36, '2025-06-25 18:34:59', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(51, 36, '2025-06-25 18:35:02', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(52, 36, '2025-06-25 18:35:04', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(53, 36, '2025-06-25 18:35:06', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(54, 36, '2025-06-25 20:18:16', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(55, NULL, '2025-06-25 20:18:38', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(56, 34, '2025-06-25 20:53:58', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(57, 39, '2025-06-25 20:58:58', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(58, 39, '2025-06-25 21:00:19', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(59, 34, '2025-06-25 22:10:21', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(60, 39, '2025-06-25 22:39:46', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(61, NULL, '2025-06-25 23:42:19', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(62, 3, '2025-06-25 23:42:33', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(63, 39, '2025-06-25 23:50:08', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(64, 37, '2025-06-25 23:50:49', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(65, 36, '2025-06-26 00:21:23', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(66, 3, '2025-06-26 00:31:39', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(67, 37, '2025-06-26 12:41:29', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(68, 37, '2025-06-26 20:51:59', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(69, 37, '2025-06-26 20:53:51', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(70, 34, '2025-06-26 20:57:14', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(71, 37, '2025-06-26 21:43:34', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(72, 37, '2025-06-29 19:00:28', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(73, 36, '2025-06-29 19:01:12', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(74, 34, '2025-06-30 15:55:11', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(75, 34, '2025-07-02 16:24:06', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(76, 34, '2025-07-06 20:25:53', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(77, 18, '2025-07-06 23:04:54', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(78, 34, '2025-07-07 03:12:59', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(79, 36, '2025-07-07 19:41:26', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(80, 18, '2025-07-07 21:03:41', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(81, 18, '2025-07-07 21:44:08', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(82, 18, '2025-07-07 22:07:38', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(83, 21, '2025-07-09 20:57:37', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(84, NULL, '2025-07-10 21:54:47', 0, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(85, 22, '2025-07-11 02:18:18', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(86, 21, '2025-07-11 02:20:17', 1, '127.0.0.1', 'Chrome 137.0.0 / Windows 10.0.0', 'Localhost'),
(87, NULL, '2025-07-14 16:39:33', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(88, 36, '2025-07-14 17:10:26', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(89, 39, '2025-07-14 17:13:45', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(90, 39, '2025-07-14 17:15:37', 1, '127.0.0.1', 'Chrome Mobile 138.0.0 / Android 6.0.0', 'Localhost'),
(91, 39, '2025-07-14 17:18:03', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(92, 32, '2025-07-14 17:19:01', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(93, 32, '2025-07-14 17:20:28', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(94, 40, '2025-07-14 17:37:14', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(95, 39, '2025-07-14 18:04:40', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(96, 32, '2025-07-14 18:05:18', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(97, 21, '2025-07-17 12:48:39', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(98, 36, '2025-07-17 16:09:14', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(99, 3, '2025-07-17 16:09:33', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(100, 3, '2025-07-17 17:36:42', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(101, 21, '2025-07-17 17:46:33', 1, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(102, 21, '2025-07-17 17:50:20', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(103, 21, '2025-07-17 17:50:39', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(104, 27, '2025-07-17 17:50:56', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(105, 3, '2025-07-17 17:52:19', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(106, 21, '2025-07-17 17:53:03', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost'),
(107, 21, '2025-07-17 17:54:24', 0, '127.0.0.1', 'Chrome 138.0.0 / Windows 10.0.0', 'Localhost');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `user_id` int(11) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`user_id`, `otp`, `expires_at`) VALUES
(27, '171790', '2025-07-14 16:55:18'),
(28, '906364', '2025-07-14 16:59:34');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `PayrollID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `PayPeriod` varchar(50) DEFAULT NULL,
  `BasicSalary` decimal(10,2) DEFAULT NULL,
  `Deductions` decimal(10,2) DEFAULT NULL,
  `Bonuses` decimal(10,2) DEFAULT NULL,
  `NetSalary` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performancereview`
--

CREATE TABLE `performancereview` (
  `ReviewID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `ReviewerID` int(11) DEFAULT NULL,
  `ReviewDate` date DEFAULT NULL,
  `Score` int(11) DEFAULT NULL,
  `Comments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `position`
--

CREATE TABLE `position` (
  `PositionID` int(11) NOT NULL,
  `PositionTitle` varchar(100) NOT NULL,
  `DepartmentID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `status`) VALUES
(1, 'Admin', 1),
(2, 'transport_birro', 1),
(3, 'system_owner', 1),
(4, 'casher', 0),
(5, 'registar', 0),
(6, 'agent', 0),
(7, 'super user', 0),
(8, 'super admin', 0);

-- --------------------------------------------------------

--
-- Table structure for table `training`
--

CREATE TABLE `training` (
  `TrainingID` int(11) NOT NULL,
  `TrainingName` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL,
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` enum('1','0') DEFAULT '1',
  `online_flag` tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `failed_attempts` int(11) DEFAULT 0,
  `lock_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `user_name`, `password`, `created_at`, `status`, `online_flag`, `updated_at`, `role_id`, `avatar_url`, `department_id`, `failed_attempts`, `lock_until`) VALUES
(1, 21, 'www', '$2b$10$wr58QSzvz/HWVMz5U8ttv.RQTQOkHMEf2S/SkYOt2eD9sTsAeQtuy', '2024-11-06 11:46:34', '1', 0, '2024-11-11 04:13:18', NULL, NULL, NULL, 0, NULL),
(2, 43, 'eeee44e@gmail.com', '$2b$10$AV7kZtfFlQwS7c34ryaCx.vgwWb7jy0pPqhDpT2Sxa/Vd5YakkEuK', '2024-11-10 23:08:20', '1', 0, '2025-07-14 18:07:08', 2, NULL, NULL, 0, NULL),
(3, 45, 'onerrr@gmail.com', '$2b$10$IFpKwiESxD3No7PwC.ShsuiJuy9.tcPRMJtEMTfQYi6Uy/NUajxZu', '2024-11-10 23:18:44', '1', 1, '2025-07-17 17:52:19', 1, NULL, NULL, 1, NULL),
(4, 46, 'woya@gmail.com', '$2b$10$OD8jd/hPB7ZcH9GJy9Pr/.ovNiO1QVNCgFbrcrXULwcH7kp.qdq.S', '2024-11-10 23:59:47', '1', 0, '2024-11-11 05:47:43', 8, NULL, NULL, 0, NULL),
(5, 48, 'hl@gmail.com', '$2b$10$Q1KieAzu4fFS0dwh6Vxty.GOgUu8xL2SyAaS1Vis9DkeMQxSt30Pq', '2024-11-11 22:30:13', '1', 0, '2025-06-26 12:39:44', 4, NULL, NULL, 0, NULL),
(6, 49, 'yonas@itp.org', '$2b$10$ktd.Y1lVFq4EOyoKkDZnhu6yJ1JNWBykmrpmFUKMBsSo4b4/IP/7K', '2024-11-11 23:41:28', '1', 0, '2024-11-20 04:42:44', 2, NULL, NULL, 0, NULL),
(7, 50, 'simegn@itp.org', '$2b$10$6SbuHMtP7XMbwVdakqMr1eTCY9QIhHxabIBHgI.CZpN9wqROs8rr6', '2024-11-11 23:44:17', '1', 1, '2025-04-17 11:19:49', NULL, '/uploads/1744466201370-photo_2024-12-21_09-16-01.jpg', NULL, 0, NULL),
(8, 51, 'hayal@itp.org', '$2b$10$8QrTeqaPBAnLZXdCHqzkMuoxgUc63IWsXMR6Qfn8FtaQ9kjaJCyWm', '2024-11-11 23:45:43', '1', 1, '2025-05-21 04:09:56', 8, NULL, NULL, 0, NULL),
(9, 54, 'hayalt@itp.org', '$2b$10$fiYp77BQuhOk9eZDl77hROkL7aEYeyLZPojgbfij/YpVo0B6IVENi', '2024-11-11 23:46:31', '1', 0, '2024-11-12 03:28:01', 8, NULL, NULL, 0, NULL),
(10, 55, 'abe@itp.et', '$2b$10$6Ptxn.bGG6WonQvgi08ZVeWOKhIf414AU.Rf8biKg5DM5w6.t6R2W', '2024-11-12 03:52:54', '1', 1, '2024-11-13 00:03:58', 4, NULL, NULL, 0, NULL),
(11, 56, 'beki33333333333@gmail.com', '$2b$10$IWJvw/rD3F5c75O71ue3JepPiTXnxsZeiUYygfRFDYGfZqeMF.IPK', '2024-11-12 03:56:31', '1', 0, '2024-11-12 03:56:31', 4, NULL, NULL, 0, NULL),
(12, 57, 'staf@gmail.com', '$2b$10$Wvcpmhed2gaCmaVQH3dEZeykZqhum/Szobc3rRweHGIhpzKO.Rxha', '2024-11-12 03:59:33', '1', 0, '2024-11-14 04:26:14', 8, NULL, NULL, 0, NULL),
(13, 58, 'nebyat@itp.et', '$2b$10$5X.XMQQMRay/6zJDdEReI.MLzAcq.ed9xBk5OO4UELVvaG2fckm5K', '2024-11-14 01:06:52', '1', 0, '2025-04-12 05:53:03', 6, NULL, NULL, 0, NULL),
(14, 59, 'ewunetu@itp.et', '$2b$10$KPHuhuIPciZ.cVg0BBCK7egMKZQqsXsNGzX/Xq4C0nBzUEEsTj62u', '2024-11-14 01:08:04', '1', 1, '2024-12-30 12:02:02', 7, NULL, NULL, 0, NULL),
(15, 60, 'manager@itp.et', '$2b$10$YC.zK8u88DfkTI.fTL7I2eZkFV0jTSPb7I3IVl99z0htdWzu9/qdW', '2024-11-14 01:34:28', '1', 0, '2024-11-19 22:29:05', 3, NULL, NULL, 0, NULL),
(16, 62, 'staf1@itp.et', '$2b$10$lQ6KmKDb38sqinMsHODD8Ocj3vR/s5y1R5EfHVaT8lCPAqULU.9i6', '2024-11-14 05:27:48', '1', 0, '2025-04-04 07:49:05', 8, NULL, NULL, 0, NULL),
(17, 63, 'berrrrrki@gmail.com', '$2b$10$44MGUjABmQFL6C39kRH.wevHAvA0URLNg0NiGjhSVMQEZLJ92VFTa', '2024-11-22 03:02:23', '1', 0, '2024-11-22 03:02:23', 6, NULL, NULL, 0, NULL),
(18, 64, 'eeee@gmail.com', '$2b$10$At9MAsh2IMjheS6B5znOmOeVCR9glbD8gKFUsKmF/mIKEqHv5P3FO', '2024-11-24 23:59:11', '1', 1, '2025-07-06 23:04:54', 1, NULL, NULL, 0, NULL),
(19, 65, 'teaml@gmail.com', '$2b$10$JoeJGvKXSfm.k0e43w0f2ujj1WWrzCZs40TF9NeqAKpWFZSQPpKxK', '2024-12-31 23:33:13', '1', 0, '2024-12-31 23:37:34', 7, NULL, NULL, 0, NULL),
(20, 66, 'teamleader@gmail.com', '$2b$10$v21VD/dHFsS60VJJTf04k.RdtLdNpWIqkiO1mTIjvbzOEuE.42ilm', '2025-01-12 22:17:46', '1', 0, '2025-02-21 08:21:26', 7, NULL, NULL, 0, NULL),
(21, 67, 'hayal@itp.it', '$2b$10$qefqaosG.peJU7AFlD4tL.61yz.TYtP1M0MZCPZq49DpoRACbmObW', '2025-02-15 08:06:02', '1', 1, '2025-07-17 17:54:24', 1, '/uploads/1744549017364-1000068407.jpg', NULL, 4, NULL),
(22, 68, 'hayalt@itp.it', '$2b$10$cfR/7GRO7CSppqM8sOd8p.aO8mqJ8JqCbgDgw.12XhH3Qta.suDka', '2025-02-15 08:07:40', '1', 1, '2025-07-11 02:18:18', 8, NULL, NULL, 0, NULL),
(23, 69, 'registrar@gmail.com', '$2b$10$JFBWyoKSFZPplsOQ2kQwcuprwdR81.YSNq5gtcq4EE1mar.vvuOAC', '2025-03-01 11:34:40', '1', 1, '2025-03-03 22:57:07', 5, NULL, NULL, 0, NULL),
(24, 70, 'nathan@itp.et', '$2b$10$ZC5FMYA2L2U2mwyA8ecV2OnJ6G4VXQRk4C1lOkSvfCGfpb48a3ig2', '2025-04-03 05:07:01', '1', 1, '2025-05-23 18:35:30', 1, NULL, NULL, 0, NULL),
(25, 71, 'hayal@gmai.com', '$2b$10$f5OlO3Z5wTJQvzbMJ/sbZudjaSo5aq2Wy/QqDK0B/MEH7HM2wcnGa', '2025-04-03 05:09:23', '1', 1, '2025-06-22 15:23:09', 3, NULL, 1, 0, NULL),
(26, 72, 'regist@bus.com', '$2b$10$EmH.IUj7tLqK3/qAzGsYt.7hvgjzDqvq0NXab9B7fQr5nlwAz.7JS', '2025-04-03 05:12:30', '1', 1, '2025-05-23 18:39:13', 5, '/uploads/1745142842358-hayal.jpg', 1, 0, NULL),
(27, 73, 'astu@nathayblog.com', '$2b$10$pZmtDgyj6IXj4gJTiQaUTu549.zUPhP9xSPce0H7Lpv9anBEHH802', '2025-04-03 05:13:57', '1', 0, '2025-07-17 17:50:56', 1, NULL, 1, 1, NULL),
(28, 75, 'hager@temechain.com', '$2b$10$ZWHXATmlE53z0PnoW.60N.u96OTbey/3V9KK7Wf2wRFnsz3hRB9xC', '2025-04-03 05:20:08', '1', 0, '2025-05-23 18:39:03', 4, NULL, 1, 0, NULL),
(29, 78, 'hager1@temechain.com', '$2b$10$8iuZQYcFRgXSLzxhDZHfyOblndo6zY9WR5CAqjJmMcFDRHqKV/Fuu', '2025-04-03 05:21:50', '1', 0, '2025-05-23 18:38:58', 4, NULL, 1, 0, NULL),
(30, 82, 'hager22@temechain.com', '$2b$10$Uz5bqrPC9R7ehMYAeBBgcehj2rsKaAgxljAFeCpeUuG4hKUgoJx.2', '2025-04-04 00:13:08', '1', 0, '2025-05-23 18:38:54', 4, NULL, 1, 0, NULL),
(31, 83, 'Hayalt@hu.edu.et', '$2b$10$kO130SYiVzJGTnFOjFj1oe6u9BaqVX4ucxLv8T1lpx8wWAGaq2UmO', '2025-04-12 02:56:33', '1', 0, '2025-05-23 18:38:48', 5, NULL, 1, 0, NULL),
(32, 84, 'Nathantamrat50@gmail.com', '$2b$10$bLJp43h2rRV1YbPk1bDJD.kXDp4kQuhW70WTPxbF0Z8hMnyQk6Dkq', '2025-04-12 04:36:57', '1', 1, '2025-07-14 17:20:28', 1, NULL, 1, 0, NULL),
(33, 85, 'astu@nathayblog.et', '$2b$10$F/KnPiHj/cL7R/HrDSCFwuRgsbLmZRPVDG3nrHk8Hwk21wytxTm.i', '2025-04-12 07:17:22', '1', 1, '2025-05-23 18:38:40', 5, NULL, 1, 0, NULL),
(34, 86, 'agent@lonche.com', '$2b$10$w.AmoLlg2mBy2UjMBxIZPuCLsukOK01ho1KmljN1hjPmzT8n4N4cu', '2025-04-16 05:00:29', '1', 1, '2025-06-25 17:49:44', 6, NULL, 1, 0, NULL),
(35, 89, 'casher@lonche.com', '$2b$10$mJnbd1tWqYLj8N7IB2T9TebFEAVDYIHL0JVNvpLXZkjnk0XK.o9xC', '2025-05-18 16:06:00', '1', 1, '2025-06-25 17:53:27', 4, NULL, 1, 5, '2025-05-25 17:58:12'),
(36, 90, 'superuser@lonche.com', '$2y$10$8ZZKrnLME1bR1u2HMUdvO.v1tzR6fLUuTamivOofAtc0h94eghOtO', '2025-05-22 21:58:47', '1', 1, '2025-07-17 16:09:14', 7, NULL, 1, 2, NULL),
(37, 91, 'menarya@lonche.com', '$2b$10$hDp7P7FVSsLMwR7eC5a2z.8Ec6teVXjnOiWv278Vb.0jt..0Ww59W', '2025-05-23 18:36:59', '1', 1, '2025-05-24 15:48:34', 2, NULL, 1, 0, NULL),
(38, 92, 'manager@loche.com', '$2b$10$esy8cd.nLJYUGctO.oDSaeSLG2flTAxslyb8LN85jcH/xhQDIaTeq', '2025-06-22 15:21:30', '1', 0, '2025-06-22 15:21:30', 3, NULL, 1, 0, NULL),
(39, 94, 'kidoastu1993@gmail.com', '$2b$10$.Fmb4U.3Yb/KF5jDEhxDiuW4NpIzjpP3.3ULMscfC1ATGIfi9K8um', '2025-06-25 20:58:40', '1', 1, '2025-07-14 17:17:23', 1, NULL, 1, 0, NULL),
(40, 95, 'tsegagosaye17@gmail.com', '$2b$10$TZv6URe6PVXNYb2mJ4bp9OWPq2TI9XohRR45j6DvOjYcAcPMBNcgq', '2025-07-14 17:36:55', '1', 1, '2025-07-14 17:37:14', 7, NULL, 1, 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`applicant_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `next_role_id` (`next_role_id`);

--
-- Indexes for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  ADD PRIMARY KEY (`approvalworkflow_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD KEY `EmployeeID` (`EmployeeID`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`conversation_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `employeeleave`
--
ALTER TABLE `employeeleave`
  ADD PRIMARY KEY (`LeaveID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `LeaveTypeID` (`LeaveTypeID`),
  ADD KEY `ApproverID` (`ApproverID`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `employees_ibfk_2` (`department_id`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `employeetraining`
--
ALTER TABLE `employeetraining`
  ADD PRIMARY KEY (`EmployeeTrainingID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `TrainingID` (`TrainingID`);

--
-- Indexes for table `hiring_decisions`
--
ALTER TABLE `hiring_decisions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `decided_by` (`decided_by`),
  ADD KEY `idx_hiring_decisions_application_id` (`application_id`);

--
-- Indexes for table `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `interviewer_id` (`interviewer_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_interviews_application_id` (`application_id`),
  ADD KEY `idx_interviews_date` (`interview_date`);

--
-- Indexes for table `interview_evaluations`
--
ALTER TABLE `interview_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluator_id` (`evaluator_id`),
  ADD KEY `idx_interview_evaluations_interview_id` (`interview_id`);

--
-- Indexes for table `jobapplication`
--
ALTER TABLE `jobapplication`
  ADD PRIMARY KEY (`ApplicationID`),
  ADD KEY `PositionID` (`PositionID`);

--
-- Indexes for table `jobposition`
--
ALTER TABLE `jobposition`
  ADD PRIMARY KEY (`PositionID`),
  ADD KEY `DepartmentID` (`DepartmentID`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_job_applications_vacancy_id` (`vacancy_id`),
  ADD KEY `idx_job_applications_user_id` (`user_id`),
  ADD KEY `idx_job_applications_status` (`status`);

--
-- Indexes for table `job_vacancies`
--
ALTER TABLE `job_vacancies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_job_vacancies_status` (`status`),
  ADD KEY `idx_job_vacancies_department` (`department`);

--
-- Indexes for table `leavetype`
--
ALTER TABLE `leavetype`
  ADD PRIMARY KEY (`LeaveTypeID`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_login_attempts` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `conversation_id` (`conversation_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`PayrollID`),
  ADD KEY `EmployeeID` (`EmployeeID`);

--
-- Indexes for table `performancereview`
--
ALTER TABLE `performancereview`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `ReviewerID` (`ReviewerID`);

--
-- Indexes for table `position`
--
ALTER TABLE `position`
  ADD PRIMARY KEY (`PositionID`),
  ADD KEY `DepartmentID` (`DepartmentID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `training`
--
ALTER TABLE `training`
  ADD PRIMARY KEY (`TrainingID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`user_name`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `fk_role_id` (`role_id`),
  ADD KEY `fk_users_department` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `applicant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  MODIFY `approvalworkflow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `conversation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employeeleave`
--
ALTER TABLE `employeeleave`
  MODIFY `LeaveID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `employeetraining`
--
ALTER TABLE `employeetraining`
  MODIFY `EmployeeTrainingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hiring_decisions`
--
ALTER TABLE `hiring_decisions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_evaluations`
--
ALTER TABLE `interview_evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobapplication`
--
ALTER TABLE `jobapplication`
  MODIFY `ApplicationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobposition`
--
ALTER TABLE `jobposition`
  MODIFY `PositionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_vacancies`
--
ALTER TABLE `job_vacancies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `leavetype`
--
ALTER TABLE `leavetype`
  MODIFY `LeaveTypeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `PayrollID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performancereview`
--
ALTER TABLE `performancereview`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `position`
--
ALTER TABLE `position`
  MODIFY `PositionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `training`
--
ALTER TABLE `training`
  MODIFY `TrainingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  ADD CONSTRAINT `approvalhierarchy_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `approvalhierarchy_ibfk_3` FOREIGN KEY (`next_role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  ADD CONSTRAINT `approvalworkflow_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `employeeleave`
--
ALTER TABLE `employeeleave`
  ADD CONSTRAINT `employeeleave_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `employeeleave_ibfk_2` FOREIGN KEY (`LeaveTypeID`) REFERENCES `leavetype` (`LeaveTypeID`),
  ADD CONSTRAINT `employeeleave_ibfk_3` FOREIGN KEY (`ApproverID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);

--
-- Constraints for table `employeetraining`
--
ALTER TABLE `employeetraining`
  ADD CONSTRAINT `employeetraining_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `employeetraining_ibfk_2` FOREIGN KEY (`TrainingID`) REFERENCES `training` (`TrainingID`);

--
-- Constraints for table `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`interviewer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `interviews_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `jobapplication`
--
ALTER TABLE `jobapplication`
  ADD CONSTRAINT `jobapplication_ibfk_1` FOREIGN KEY (`PositionID`) REFERENCES `jobposition` (`PositionID`);

--
-- Constraints for table `jobposition`
--
ALTER TABLE `jobposition`
  ADD CONSTRAINT `jobposition_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`);

--
-- Constraints for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`vacancy_id`) REFERENCES `job_vacancies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `job_vacancies`
--
ALTER TABLE `job_vacancies`
  ADD CONSTRAINT `job_vacancies_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD CONSTRAINT `fk_user_login_attempts` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `performancereview`
--
ALTER TABLE `performancereview`
  ADD CONSTRAINT `performancereview_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`),
  ADD CONSTRAINT `performancereview_ibfk_2` FOREIGN KEY (`ReviewerID`) REFERENCES `employee` (`EmployeeID`);

--
-- Constraints for table `position`
--
ALTER TABLE `position`
  ADD CONSTRAINT `position_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `department` (`DepartmentID`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
