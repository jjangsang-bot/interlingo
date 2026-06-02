export type TravelQuestion = {
  id: number;
  korean: string;
  answers: string[];
  hints: string[];
};

export const travelQuestions: TravelQuestion[] = [
  {
    id: 1,
    korean: "공항까지 어떻게 가나요?",
    answers: ["How do I get to the airport?", "How can I get to the airport?"],
    hints: ["airport", "How do I get to ...?", "How do I get to the a..."]
  },
  {
    id: 2,
    korean: "호텔에 체크인하고 싶습니다.",
    answers: ["I would like to check in at the hotel.", "I'd like to check in at the hotel."],
    hints: ["check in, hotel", "I would like to + verb", "I would like to check i..."]
  },
  {
    id: 3,
    korean: "이 기차는 서울역에 정차하나요?",
    answers: ["Does this train stop at Seoul Station?"],
    hints: ["train, stop, Seoul Station", "Does this + noun + verb at ...?", "Does this train stop at S..."]
  },
  {
    id: 4,
    korean: "창가 좌석으로 부탁드립니다.",
    answers: ["A window seat, please.", "I'd like a window seat, please."],
    hints: ["window seat", "A + noun, please.", "A window s..."]
  },
  {
    id: 5,
    korean: "근처에 좋은 식당이 있나요?",
    answers: ["Is there a good restaurant nearby?", "Are there any good restaurants nearby?"],
    hints: ["restaurant, nearby", "Is there a + noun + nearby?", "Is there a good r..."]
  },
  {
    id: 6,
    korean: "사진을 찍어 주시겠어요?",
    answers: ["Could you take a picture of me?", "Could you take a photo of me?"],
    hints: ["take, picture", "Could you + verb + a picture of me?", "Could you take a p..."]
  },
  {
    id: 7,
    korean: "여기서 박물관까지 얼마나 걸리나요?",
    answers: ["How long does it take to get to the museum from here?"],
    hints: ["how long, museum, from here", "How long does it take to get to ...?", "How long does it take to get to the m..."]
  },
  {
    id: 8,
    korean: "이 표를 취소할 수 있나요?",
    answers: ["Can I cancel this ticket?"],
    hints: ["cancel, ticket", "Can I + verb + this noun?", "Can I cancel this t..."]
  },
  {
    id: 9,
    korean: "와이파이 비밀번호가 무엇인가요?",
    answers: ["What is the Wi-Fi password?", "What's the Wi-Fi password?"],
    hints: ["Wi-Fi, password", "What is the + noun?", "What is the Wi-Fi p..."]
  },
  {
    id: 10,
    korean: "짐을 잠시 맡길 수 있을까요?",
    answers: ["Can I leave my luggage here for a while?", "Could I leave my luggage here for a while?"],
    hints: ["leave, luggage, for a while", "Can I leave my + noun + here for a while?", "Can I leave my l..."]
  }
];
