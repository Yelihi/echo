export const practiceModes = [
  {
    id: "roleplay",
    name: "롤플레잉",
    label: "ROLEPLAY",
    title: "대화 속에서,\n영어가 나의 말이 되도록.",
    description:
      "카페에서의 주문부터 새로운 사람과의 첫인사까지.\n주고받는 대화로 일상의 영어를 연습하세요.",
    image: "/images/practice/cafe.webp",
    imageAlt: "작은 테이블에 두 잔의 커피가 놓인 카페",
    imageTitle: "Make it\na conversation.",
    href: "/role-playing",
    note: "상대방과 주고받는 말하기 연습",
  },
  {
    id: "memorization",
    name: "문단 암기",
    label: "MEMORIZATION",
    title: "좋은 문장을,\n오래 남는 나의 표현으로.",
    description:
      "기억하고 싶은 글을 읽고, 떠올리고, 말해보세요.\n문단을 반복하며 나만의 표현을 차곡차곡 쌓아요.",
    image: "/images/practice/reading.webp",
    imageAlt: "햇살이 들어오는 조용한 독서 공간과 펼쳐진 책",
    imageTitle: "Words\nto keep.",
    href: "/sentence-memorization",
    note: "읽고 기억하며 익히는 문단 연습",
  },
] as const;
