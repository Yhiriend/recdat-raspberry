
CREATE TABLE `functionary` (
  `id` varchar(40) NOT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `second_name` varchar(45) DEFAULT NULL,
  `first_surname` varchar(45) DEFAULT NULL,
  `second_surname` varchar(45) DEFAULT NULL,
  `id_number` varchar(45) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `users_id` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `functionary` (`id`, `first_name`, `second_name`, `first_surname`, `second_surname`, `id_number`, `phone`, `email`, `address`, `users_id`) VALUES
('b37f40aa-feb1-11ee-9350-088fc367e4d0', 'jose', 'maria', 'prueba', 'login', '100200300', '3244232332', 'josemariaprueba@gmail.com', 'via al castillito blanco', '2a69f6b6-feb1-11ee-9350-088fc367e4d0');


CREATE TABLE `teaching_assistance` (
  `id` varchar(40) NOT NULL,
  `teacher_id` varchar(40) NOT NULL,
  `photo` varchar(1000) DEFAULT NULL,
  `entry_date` date DEFAULT NULL,
  `entry_time` varchar(20) DEFAULT NULL,
  `departure_time` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `teaching_assistance` (`id`, `teacher_id`, `photo`, `entry_date`, `entry_time`, `departure_time`) VALUES
('243bac11-feb2-11ee-9350-088fc367e4d0', 'b37f40aa-feb1-11ee-9350-088fc367e4d0', 'path', '2024-04-19', '2024-04-19 20:05:54', '2024-04-19 20:05:54');


CREATE TABLE `users` (
  `id` varchar(40) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
('2a69f6b6-feb1-11ee-9350-088fc367e4d0', 'juan cueto', 'jcueto', 'superadmin');


ALTER TABLE `functionary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`),
  ADD KEY `fk_teachers_users1_idx` (`users_id`);


ALTER TABLE `teaching_assistance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_teaching_assistance_teachers1_idx` (`teacher_id`);


ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `functionary`
  ADD CONSTRAINT `fk_teachers_users1` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE `teaching_assistance`
  ADD CONSTRAINT `fk_teaching_assistance_teachers1` FOREIGN KEY (`teacher_id`) REFERENCES `functionary` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
