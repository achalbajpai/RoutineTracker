# LifeTrack Pro

LifeTrack Pro is a comprehensive personal productivity companion built with Next.js and React. It offers a range of features to help users manage their daily routines, track various aspects of their life, and stay motivated through a leaderboard system.

## Features

- **User Authentication**: Secure login and signup functionality with password complexity requirements.
- **Daily Routine Management**: Create, edit, and view daily routines with task completion tracking.
- **Calendar View**: Visualize routines and gym sessions on a calendar.
- **Gym Tracker**: Log and view workout sessions.
- **Sleep Tracker**: Record sleep duration and quality.
- **Study Tracker**: Keep track of time spent on different subjects.
- **Homework Manager**: Add, complete, and manage homework tasks.
- **Goal Setting**: Set and track personal goals across various fields.
- **Leaderboard**: Compare productivity with other users.
- **Routine History**: Review past routines for reference.
- **User Profile**: Manage personal information and upload a profile picture.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Local Storage for data persistence
- js-cookie for remembering user login

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The main component (`Component`) handles all the functionality of the app. It uses various states to manage user data and UI interactions. The app is divided into different sections, each accessible through a menu:

- Daily Routine
- Calendar
- Gym Tracker
- Sleep Tracker
- Study Tracker
- Homework
- Goals
- Leaderboard
- Routine History
- Profile

Each section is rendered conditionally based on the `currentSection` state.

## Data Persistence

The app uses browser's Local Storage to persist user data, including routines, tasks, gym sessions, sleep data, and more. This allows users to retain their information between sessions without the need for a backend server.

## Styling

The app uses Tailwind CSS for styling, with additional custom components from the shadcn/ui library. The design is responsive and features a clean, modern interface.

## Future Improvements

- Implement a backend server for more secure and scalable data storage
- Add data visualization for sleep, study, and gym tracking
- Implement social features, such as sharing routines or competing with friends
- Add notifications and reminders for tasks and goals

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
