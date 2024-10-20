# Chatbot JSON Documentation

## Overview

This JSON file represents a chatbot flow where users interact through a series of questions and answers. The flow changes based on user input, allowing for dynamic conversation paths.

### Key Concepts:

- **Intro**: The initial message that the user sees when they start interacting with the chatbot.
- **Questions**: Each question is associated with a set of possible responses. The chatbot dynamically navigates based on these answers.
- **Next**: The flow control mechanism. It defines the next question to be asked or if the conversation ends.

---

## Structure

### 1. `intro`

This section contains a welcome message for the user when they start interacting with the chatbot.

```json
{
  "intro": {
    "message": "Hello there! Welcome to Hogist Online Service. We have the best solution for all your food needs. I am Hogist Chat Buddy here to assist you.",
    "type": "message"
  }
}
```

- **`message`**: Text that the chatbot will display to the user.
- **`type`**: The type of response (here it is a simple message).

---

### 2. `questions`

This is an array of question objects. Each object represents a question that the chatbot will ask and contains the following key elements:

#### 2.1. Question Object

Each question is represented by an object with the following structure:

```json
{
  "id": 1,
  "question": "Hey there! Could you send me your mobile number please?",
  "answerType": {
    "type": "custom_message",
    "restrictions": {
      "regex": "^\\d{10}$",
      "errorMessage": "Please enter a valid 10-digit mobile number."
    }
  },
  "next": 2
}
```

##### Fields:

- **`id`**: Unique identifier for the question.
- **`question`**: The text of the question that the chatbot will ask.
- **`answerType`**: Specifies how the chatbot expects the user to respond.
  - **`type`**: Can be one of the following:
    - `custom_message`: The user can input free text.
    - `choice`: The user must select from predefined options.
    - `choice_with_other`: The user can either select a predefined option or provide custom input.
  - **`restrictions`** (optional): Validation rules for custom inputs.
    - **`regex`**: A regular expression used to validate the user's input.
    - **`errorMessage`**: The message displayed when validation fails.
- **`next`**: Determines the next step in the chat flow. If `next` is `-1`, it means the conversation ends. Otherwise, it points to the `id` of the next question.

---

#### 2.2. Answer Types

##### `custom_message`

Used when the user is expected to type in an answer freely.

```json
"answerType": {
  "type": "custom_message"
}
```

##### `choice`

Used when the user selects an answer from predefined options.

```json
"answerType": {
  "type": "choice"
}
```

##### `choice_with_other`

Used when the user selects either a predefined option or provides a custom input.

```json
"answerType": {
  "type": "choice_with_other",
  "otherPrompt": "Please specify your service."
}
```

---

### 3. `next`

Each question includes a `next` field, which defines what happens after the user provides an answer:

#### Simple Flow:

```json
"next": 2
```

This means the next question is the one with `id: 2`.

#### End of Flow:

```json
"next": -1
```

This means the conversation ends after this question.

#### Dynamic Flow:

For questions where the next step depends on the user's choice, the `next` field contains a map of possible answers to their corresponding next steps:

```json
"next": {
  "Event food services": 4,
  "Corporate food services": 8,
  "Industrial food services": 8,
  "Cafeteria food services": 8,
  "Others": 12
}
```

In this example:

- If the user selects "Event food services", the chatbot will proceed to the question with `id: 4`.
- If they select "Corporate food services", "Industrial food services", or "Cafeteria food services", the chatbot will proceed to the question with `id: 8`.
- If they select "Others", the chatbot will go to question `id: 12`.

---

### 4. `closing`

At the end of the conversation, the chatbot sends a closing message.

```json
{
  "closing": {
    "message": "Thank you for your patience. The Hogist team will reach you shortly. If you have any queries, please call us at (999 999 9999). Happy to serve you!",
    "type": "message"
  }
}
```

- **`message`**: The text shown at the end of the conversation.
- **`type`**: Specifies that this is a closing message.

---

## Flows

There are **three main flows** based on the user's response to the third question:

1. **Event food services** → Leads to question `id: 4`, asking about the count of people.
2. **Corporate, Industrial, or Cafeteria food services** → Leads to question `id: 8`, which asks similar questions for these types of services.
3. **Others** → Leads to question `id: 12`, where the user provides free input on how they need help.

---

## Example Flow

Here’s an example of a conversation flow:

1. **Intro** → Chatbot sends a welcome message.
2. **Question 1** → "Hey there! Could you send me your mobile number?"
   - User enters: "9999999999"
3. **Question 2** → "What's your name?"
   - User enters: "John"
4. **Question 3** → "Hey John! What tasty treats are you in the mood for?"
   - User selects: "Event food services"
5. **Question 4** → "How many Count do you think that you are looking for?"
   - User selects: "50-100"
6. **Question 5** → "What type of food are you craving?"
   - User selects: "Veg"
7. **Question 6** → "Do you need any extra services to make your experience even better?"
   - User selects: "No thanks"
8. **Question 7** → "Could you share your event location with me?"
   - User enters: "Nungambakkam, Chennai"
9. **Closing** → "Thank you for your patience..."

---

## Conclusion

This JSON structure offers flexibility in defining dynamic chatbot interactions. The flow can change based on user input, ensuring a personalized experience for each user. The chatbot can guide users through specific services, making the interaction efficient and user-friendly.
