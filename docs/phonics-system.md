# Phoneme Learning System Spec

## 🎯 Goal
Build a phoneme-based learning engine that transforms:
phoneme → learning card → exercises → daily plan

---

## 🧩 Core Concept
Each phoneme must be learned in 3 layers:
1. Sound
2. Mouth
3. Pattern

---

## 🧱 Data Model

### phoneme
{
  "id": "eə",
  "symbol": "/eə/",
  "type": "diphthong",
  "sound_hint": "类似“诶-呃”的滑音",
  "mouth_shape": "嘴巴张开，从 e 滑向 ə",
  "spelling_patterns": ["air", "ear", "are"],
  "example_words": ["hair", "chair", "where"],
  "confusable_with": ["ɪə"]
}

---

## 📘 Learning Card Structure
1. Sound
2. Mouth
3. Pattern
4. Contrast

---

## 🧪 Exercise Types
1. Sound → Word
2. Word → Sound
3. Underline Match
4. Contrast Choice

---

## 📅 Daily Plan
25 days phoneme training + 5 days revision

---

## 🧠 Key Rule
phoneme → contrast → exercise
