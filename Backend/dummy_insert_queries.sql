INSERT INTO resources (
    id, employee_id, name, email, designation, location, status,
    availability_date, release_date, total_experience,
    ctc, ctc_currency, created_at, updated_at
) VALUES
      (1, 'EMP001', 'Rajesh Kumar', 'rajesh.kumar@xebia.com', 'Senior Software Engineer', 'Bangalore', 'ATP', '2024-03-01', NULL, 5, 1200000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (2, 'EMP002', 'Priya Sharma', 'priya.sharma@xebia.com', 'Software Engineer', 'Mumbai', 'DEPLOYED', NULL, NULL, 3, 800000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (3, 'EMP003', 'Amit Patel', 'Lead Developer', 'amit.patel@xebia.com', 'Delhi', 'ATP', '2024-02-15', NULL, 8, 1800000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (4, 'EMP004', 'Sneha Reddy', 'sneha.reddy@xebia.com', 'Full Stack Developer', 'Bangalore', 'SOFT_BLOCKED', '2024-04-01', '2024-06-30', 4, 1000000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (5, 'EMP005', 'Vikram Singh', 'vikram.singh@xebia.com', 'DevOps Engineer', 'Pune', 'ATP', '2024-03-10', NULL, 6, 1400000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (6, 'EMP006', 'Anjali Mehta', 'anjali.mehta@xebia.com', 'QA Engineer', 'Mumbai', 'NOTICE', '2024-05-01', NULL, 4, 900000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (7, 'EMP007', 'Rahul Verma', 'rahul.verma@xebia.com', 'Backend Developer', 'Bangalore', 'ATP', '2024-02-20', NULL, 5, 1100000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (8, 'EMP008', 'Kavita Nair', 'kavita.nair@xebia.com', 'Frontend Developer', 'Delhi', 'DEPLOYED', NULL, NULL, 3, 850000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (9, 'EMP009', 'Mohit Agarwal', 'mohit.agarwal@xebia.com', 'Cloud Architect', 'Bangalore', 'ATP', '2024-03-05', NULL, 10, 2500000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (10, 'EMP010', 'Divya Joshi', 'divya.joshi@xebia.com', 'Data Engineer', 'Pune', 'LEAVE', '2024-04-15', NULL, 5, 1150000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (11, 'EMP011', 'Arjun Desai', 'arjun.desai@xebia.com', 'Mobile Developer', 'Mumbai', 'ATP', '2024-02-28', NULL, 4, 950000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (12, 'EMP012', 'Meera Iyer', 'meera.iyer@xebia.com', 'UI/UX Designer', 'Bangalore', 'TRAINEE', '2024-05-10', NULL, 1, 500000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (13, 'EMP013', 'Suresh Menon', 'suresh.menon@xebia.com', 'Solution Architect', 'Delhi', 'DEPLOYED', NULL, NULL, 12, 3000000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (14, 'EMP014', 'Pooja Shah', 'pooja.shah@xebia.com', 'React Developer', 'Pune', 'ATP', '2024-03-15', NULL, 4, 1050000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (15, 'EMP015', 'Kiran Rao', 'kiran.rao@xebia.com', 'Java Developer', 'Bangalore', 'INTERVIEW_SCHEDULED', '2024-04-01', NULL, 6, 1300000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (16, 'EMP016', 'Neha Gupta', 'neha.gupta@xebia.com', 'Python Developer', 'Mumbai', 'ATP', '2024-02-25', NULL, 5, 1120000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (17, 'EMP017', 'Ravi Krishnan', 'ravi.krishnan@xebia.com', 'Node.js Developer', 'Delhi', 'DEPLOYED', NULL, NULL, 7, 1600000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (18, 'EMP018', 'Shilpa Bansal', 'shilpa.bansal@xebia.com', 'Angular Developer', 'Pune', 'ATP', '2024-03-20', NULL, 4, 980000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (19, 'EMP019', 'Nikhil Malhotra', 'nikhil.malhotra@xebia.com', 'Spring Boot Developer', 'Bangalore', 'SOFT_BLOCKED', '2024-04-10', '2024-07-10', 6, 1350000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (20, 'EMP020', 'Swati Kapoor', 'swati.kapoor@xebia.com', 'Microservices Developer', 'Mumbai', 'ATP', '2024-03-08', NULL, 5, 1180000.00, 'INR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


INSERT INTO resource_skills (resource_id, skill_name, skill_level, skill_type, years_of_experience) VALUES
-- Resource 1
(1, 'Java', 'ADVANCED', 'PRIMARY', 5),
(1, 'Spring Boot', 'ADVANCED', 'PRIMARY', 4),
(1, 'MySQL', 'INTERMEDIATE', 'SECONDARY', 3),

-- Resource 2
(2, 'Python', 'INTERMEDIATE', 'PRIMARY', 3),
(2, 'Django', 'INTERMEDIATE', 'PRIMARY', 2),
(2, 'PostgreSQL', 'BEGINNER', 'SECONDARY', 1),

-- Resource 3
(3, 'JavaScript', 'EXPERT', 'PRIMARY', 8),
(3, 'Node.js', 'ADVANCED', 'PRIMARY', 6),
(3, 'React', 'ADVANCED', 'PRIMARY', 5),
(3, 'MongoDB', 'INTERMEDIATE', 'SECONDARY', 4),

-- Resource 4
(4, 'React', 'ADVANCED', 'PRIMARY', 4),
(4, 'Node.js', 'INTERMEDIATE', 'PRIMARY', 3),
(4, 'TypeScript', 'INTERMEDIATE', 'SECONDARY', 2),

-- Resource 5
(5, 'AWS', 'ADVANCED', 'PRIMARY', 6),
(5, 'Docker', 'ADVANCED', 'PRIMARY', 5),
(5, 'Kubernetes', 'INTERMEDIATE', 'PRIMARY', 4),
(5, 'Jenkins', 'INTERMEDIATE', 'SECONDARY', 3),

-- Resource 6
(6, 'Selenium', 'ADVANCED', 'PRIMARY', 4),
(6, 'Java', 'INTERMEDIATE', 'PRIMARY', 3),
(6, 'TestNG', 'INTERMEDIATE', 'SECONDARY', 2),

-- Resource 7
(7, 'Java', 'ADVANCED', 'PRIMARY', 5),
(7, 'Spring Framework', 'ADVANCED', 'PRIMARY', 4),
(7, 'Hibernate', 'INTERMEDIATE', 'SECONDARY', 3),

-- Resource 8
(8, 'React', 'INTERMEDIATE', 'PRIMARY', 3),
(8, 'JavaScript', 'INTERMEDIATE', 'PRIMARY', 3),
(8, 'HTML/CSS', 'ADVANCED', 'SECONDARY', 4),

-- Resource 9
(9, 'AWS', 'EXPERT', 'PRIMARY', 10),
(9, 'Azure', 'ADVANCED', 'PRIMARY', 8),
(9, 'Terraform', 'ADVANCED', 'PRIMARY', 6),
(9, 'Kubernetes', 'ADVANCED', 'SECONDARY', 5),

-- Resource 10
(10, 'Python', 'ADVANCED', 'PRIMARY', 5),
(10, 'Apache Spark', 'INTERMEDIATE', 'PRIMARY', 3),
(10, 'Hadoop', 'INTERMEDIATE', 'SECONDARY', 2),

-- Resource 11
(11, 'React Native', 'INTERMEDIATE', 'PRIMARY', 4),
(11, 'Flutter', 'BEGINNER', 'PRIMARY', 1),
(11, 'JavaScript', 'INTERMEDIATE', 'SECONDARY', 3),

-- Resource 12
(12, 'Figma', 'BEGINNER', 'PRIMARY', 1),
(12, 'Adobe XD', 'BEGINNER', 'PRIMARY', 1),
(12, 'Sketch', 'BEGINNER', 'SECONDARY', 0),

-- Resource 13
(13, 'Java', 'EXPERT', 'PRIMARY', 12),
(13, 'Microservices', 'EXPERT', 'PRIMARY', 10),
(13, 'System Design', 'EXPERT', 'PRIMARY', 12),
(13, 'Kafka', 'ADVANCED', 'SECONDARY', 6),

-- Resource 14
(14, 'React', 'ADVANCED', 'PRIMARY', 4),
(14, 'Redux', 'INTERMEDIATE', 'PRIMARY', 3),
(14, 'TypeScript', 'INTERMEDIATE', 'SECONDARY', 2),

-- Resource 15
(15, 'Java', 'ADVANCED', 'PRIMARY', 6),
(15, 'Spring Boot', 'ADVANCED', 'PRIMARY', 5),
(15, 'REST API', 'ADVANCED', 'PRIMARY', 5),

-- Resource 16
(16, 'Python', 'ADVANCED', 'PRIMARY', 5),
(16, 'Flask', 'INTERMEDIATE', 'PRIMARY', 3),
(16, 'FastAPI', 'INTERMEDIATE', 'SECONDARY', 2),

-- Resource 17
(17, 'Node.js', 'ADVANCED', 'PRIMARY', 7),
(17, 'Express.js', 'ADVANCED', 'PRIMARY', 6),
(17, 'MongoDB', 'ADVANCED', 'PRIMARY', 5),

-- Resource 18
(18, 'Angular', 'INTERMEDIATE', 'PRIMARY', 4),
(18, 'TypeScript', 'INTERMEDIATE', 'PRIMARY', 3),
(18, 'RxJS', 'BEGINNER', 'SECONDARY', 1),

-- Resource 19
(19, 'Java', 'ADVANCED', 'PRIMARY', 6),
(19, 'Spring Boot', 'ADVANCED', 'PRIMARY', 5),
(19, 'Microservices', 'INTERMEDIATE', 'PRIMARY', 4),

-- Resource 20
(20, 'Java', 'ADVANCED', 'PRIMARY', 5),
(20, 'Spring Cloud', 'INTERMEDIATE', 'PRIMARY', 4),
(20, 'Docker', 'INTERMEDIATE', 'PRIMARY', 3),
(20, 'Kubernetes', 'BEGINNER', 'SECONDARY', 1);
