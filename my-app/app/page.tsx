'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Unlock, UserPlus, LogIn, CalendarIcon, Rocket, Medal, Moon, Dumbbell, Book, Target, Bookmark, Trophy } from 'lucide-react'

type User = {
  username: string;
  password: string;
}

type Task = {
  text: string;
  completed: boolean;
}

type SleepData = {
  date: string;
  duration: number;
  quality: number;
}

type SubjectWork = {
  subject: string;
  duration: number;
}

type Homework = {
  subject: string;
  description: string;
  completed: boolean;
}

type Goal = {
  field: string;
  description: string;
  completed: boolean;
}

type LeaderboardEntry = {
  username: string;
  routineCount: number;
}

export default function Component() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [date, setDate] = useState('')
  const [routine, setRoutine] = useState('')
  const [nextDayRoutine, setNextDayRoutine] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [routineDays, setRoutineDays] = useState<string[]>([])
  const [workoutType, setWorkoutType] = useState('')
  const [gymDays, setGymDays] = useState<{[key: string]: string}>({})
  const [sleepData, setSleepData] = useState<SleepData[]>([])
  const [subjectWork, setSubjectWork] = useState<SubjectWork[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [rememberMe, setRememberMe] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
    const today = new Date().toISOString().split('T')[0]
    setDate(today)

    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
      const { username, password } = JSON.parse(rememberedUser)
      handleLogin(username, password)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadRoutine(date)
      loadRoutineDays()
      loadGymDays()
      loadSleepData()
      loadSubjectWork()
      loadHomework()
      loadGoals()
      updateLeaderboard()
    }
  }, [currentUser, date])

  const handleSignUp = (username: string, password: string) => {
    if (users.some(user => user.username === username)) {
      alert('Username already exists')
      return
    }
    const newUsers = [...users, { username, password }]
    setUsers(newUsers)
    localStorage.setItem('users', JSON.stringify(newUsers))
    setCurrentUser(username)
    setIsLoggedIn(true)
    localStorage.setItem(`${username}_routine_${date}`, '')
    localStorage.setItem(`${username}_tasks_${date}`, '[]')
    localStorage.setItem(`${username}_gymDays`, '{}')
    localStorage.setItem(`${username}_sleepData`, '[]')
    localStorage.setItem(`${username}_subjectWork`, '[]')
    localStorage.setItem(`${username}_homework`, '[]')
    localStorage.setItem(`${username}_goals`, '[]')
    updateLeaderboard()
  }

  const handleLogin = (username: string, password: string) => {
    const user = users.find(user => user.username === username && user.password === password)
    if (user) {
      setCurrentUser(username)
      setIsLoggedIn(true)
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username, password }))
      }
      updateLeaderboard()
    } else {
      alert('Invalid username or password')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setRoutine('')
    setNextDayRoutine('')
    setTasks([])
    setRoutineDays([])
    setWorkoutType('')
    setGymDays({})
    setSleepData([])
    setSubjectWork([])
    setHomework([])
    setGoals([])
    localStorage.removeItem('rememberedUser')
  }

  const loadRoutine = (selectedDate: string) => {
    if (!currentUser) return
    const storedRoutine = localStorage.getItem(`${currentUser}_routine_${selectedDate}`)
    const storedTasks = JSON.parse(localStorage.getItem(`${currentUser}_tasks_${selectedDate}`) || '[]')
    if (storedRoutine) setRoutine(storedRoutine)
    setTasks(storedTasks)
  }

  const loadRoutineDays = () => {
    if (!currentUser) return
    const storedDays = Object.keys(localStorage).filter(key => key.startsWith(`${currentUser}_routine_`))
    setRoutineDays(storedDays.map(key => key.replace(`${currentUser}_routine_`, '')))
  }

  const loadGymDays = () => {
    if (!currentUser) return
    const storedGymDays = localStorage.getItem(`${currentUser}_gymDays`)
    if (storedGymDays) {
      setGymDays(JSON.parse(storedGymDays))
    }
  }

  const loadSleepData = () => {
    if (!currentUser) return
    const storedSleepData = localStorage.getItem(`${currentUser}_sleepData`)
    if (storedSleepData) {
      setSleepData(JSON.parse(storedSleepData))
    }
  }

  const loadSubjectWork = () => {
    if (!currentUser) return
    const storedSubjectWork = localStorage.getItem(`${currentUser}_subjectWork`)
    if (storedSubjectWork) {
      setSubjectWork(JSON.parse(storedSubjectWork))
    }
  }

  const loadHomework = () => {
    if (!currentUser) return
    const storedHomework = localStorage.getItem(`${currentUser}_homework`)
    if (storedHomework) {
      setHomework(JSON.parse(storedHomework))
    }
  }

  const loadGoals = () => {
    if (!currentUser) return
    const storedGoals = localStorage.getItem(`${currentUser}_goals`)
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals))
    }
  }

  const updateLeaderboard = () => {
    const leaderboardData = users.map(user => {
      const routineKeys = Object.keys(localStorage).filter(key => key.startsWith(`${user.username}_routine_`))
      return {
        username: user.username,
        routineCount: routineKeys.length
      }
    })
    leaderboardData.sort((a, b) => b.routineCount - a.routineCount)
    setLeaderboard(leaderboardData)
  }

  const handleRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    localStorage.setItem(`${currentUser}_routine_${date}`, routine)
    const parsedTasks = routine.split('\n').filter(line => line.includes(':') && !line.startsWith('>'))
    const newTasks = parsedTasks.map(task => ({ text: task, completed: false }))
    setTasks(newTasks)
    localStorage.setItem(`${currentUser}_tasks_${date}`, JSON.stringify(newTasks))
    loadRoutineDays()
    updateLeaderboard()
    alert('Routine saved!')
  }

  const handleNextDayRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayString = nextDay.toISOString().split('T')[0]
    localStorage.setItem(`${currentUser}_routine_${nextDayString}`, nextDayRoutine)
    loadRoutineDays()
    updateLeaderboard()
    alert('Next day routine saved!')
  }

  const handleTaskToggle = (index: number) => {
    if (!currentUser) return
    const newTasks = [...tasks]
    newTasks[index].completed = !newTasks[index].completed
    setTasks(newTasks)
    localStorage.setItem(`${currentUser}_tasks_${date}`, JSON.stringify(newTasks))
  }

  const handleAddWorkout = () => {
    if (!currentUser || !date || !workoutType) return
    const updatedGymDays = { ...gymDays, [date]: workoutType }
    setGymDays(updatedGymDays)
    localStorage.setItem(`${currentUser}_gymDays`, JSON.stringify(updatedGymDays))
    alert('Workout added successfully!')
  }

  const handleSleepSubmit = (duration: number, quality: number) => {
    if (!currentUser) return
    const newSleepData = [...sleepData, { date, duration, quality }]
    setSleepData(newSleepData)
    localStorage.setItem(`${currentUser}_sleepData`, JSON.stringify(newSleepData))
    alert('Sleep data saved!')
  }

  const handleSubjectWorkSubmit = (subject: string, duration: number) => {
    if (!currentUser) return
    const newSubjectWork = [...subjectWork, { subject, duration }]
    setSubjectWork(newSubjectWork)
    localStorage.setItem(`${currentUser}_subjectWork`, JSON.stringify(newSubjectWork))
    alert('Subject work saved!')
  }

  const handleHomeworkSubmit = (subject: string, description: string) => {
    if (!currentUser) return
    const newHomework = [...homework, { subject, description, completed: false }]
    setHomework(newHomework)
    localStorage.setItem(`${currentUser}_homework`, JSON.stringify(newHomework))
    alert('Homework added successfully!')
  }

  const handleHomeworkToggle = (index: number) => {
    if (!currentUser) return
    const newHomework = [...homework]
    newHomework[index].completed = !newHomework[index].completed
    setHomework(newHomework)
    localStorage.setItem(`${currentUser}_homework`, JSON.stringify(newHomework))
  }

  const handleGoalSubmit = (field: string, description: string) => {
    if (!currentUser) return
    const newGoals = [...goals, { field, description, completed: false }]
    setGoals(newGoals)
    localStorage.setItem(`${currentUser}_goals`, JSON.stringify(newGoals))
    alert('Goal added successfully!')
  }

  const handleGoalToggle = (index: number) => {
    if (!currentUser) return
    const newGoals = [...goals]
    newGoals[index].completed = !newGoals[index].completed
    setGoals(newGoals)
    localStorage.setItem(`${currentUser}_goals`, JSON.stringify(newGoals))
  }

  const formatRoutine = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**__')) {
        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace(/\*\*__|\*\*|__/g, '')}</h2>
      } else if (line.startsWith('> **')) {
        return <h3 key={index} className="text-lg font-semibold mt-3 mb-1">{line.replace(/> \*\*|\*\*/g, '')}</h3>
      } else if (line.includes(':')) {
        const [time, task] = line.split(':')
        return (
          <div key={index} className="flex items-center mb-1">
            <span className="font-medium mr-2">{time.trim()}:</span>
            <span>{task.trim()}</span>
          </div>
        )
      }
      return <p key={index}>{line}</p>
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <Card className="w-[400px] bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">LifeTrack Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">Your all-in-one personal productivity companion</p>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.currentTarget.username.value, e.currentTarget.password.value) }} className="space-y-4">
                  <Input name="username" type="text" placeholder="Username" required className="bg-gray-100" />
                  <Input name="password" type="password" placeholder="Password" required className="bg-gray-100" />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                    <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Remember me
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">Login</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(e.currentTarget.username.value, e.currentTarget.password.value) }} className="space-y-4">
                  <Input name="username" type="text" placeholder="Username" required className="bg-gray-100" />
                  <Input name="password" type="password" placeholder="Password" required className="bg-gray-100" />
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">Sign Up</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Welcome to LifeTrack Pro, {currentUser}!
            <Button variant="outline" onClick={handleLogout}>
              <Unlock className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="routine">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="routine">
            <Rocket className="mr-2 h-4 w-4" /> Daily Routine 
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="gym">
            <Dumbbell className="mr-2 h-4 w-4" /> Gym Tracker
          </TabsTrigger>
          <TabsTrigger value="sleep">
            <Moon className="mr-2 h-4 w-4" /> Sleep Tracker
          </TabsTrigger>
          <TabsTrigger value="study">
            <Book className="mr-2 h-4 w-4" /> Study Tracker
          </TabsTrigger>
          <TabsTrigger value="homework">
            <Bookmark className="mr-2 h-4 w-4" /> Homework
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="mr-2 h-4 w-4" /> Goals
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="routine">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Routine 📅</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRoutineSubmit} className="space-y-4">
                <Textarea
                  placeholder="Enter your daily routine"
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                  rows={10}
                />
                <Button type="submit">Save Routine</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Routine for {date} 📆</CardTitle>
            </CardHeader>
            <CardContent>
              {formatRoutine(routine)}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Task Completion ✅</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`task-${index}`}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(index)}
                  />
                  <label
                    htmlFor={`task-${index}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.completed ? 'line-through' : ''
                    }`}
                  >
                    {task.text}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Day Routine 🔮</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNextDayRoutineSubmit} className="space-y-4">
                <Textarea
                  placeholder="Enter your routine for the next day"
                  value={nextDayRoutine}
                  onChange={(e) => setNextDayRoutine(e.target.value)}
                  rows={10}
                />
                <Button type="submit">Save Next Day Routine</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Routine Calendar 📅</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date(date)}
                onSelect={(newDate) => newDate && setDate(newDate.toISOString().split('T')[0])}
                className="rounded-md border"
                modifiers={{
                  routine: (date) => routineDays.includes(date.toISOString().split('T')[0])
                }}
                modifiersStyles={{
                  routine: { backgroundColor: 'rgba(0, 255, 0, 0.1)', color: 'green', fontWeight: 'bold' }
                }}
              />
              <p className="mt-4">
                Days with routines: {routineDays.length}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gym">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Gym Workout 💪</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
                  <Select onValueChange={setWorkoutType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leg">Leg Day 🦵</SelectItem>
                      <SelectItem value="chest">Chest Day 💪</SelectItem>
                      <SelectItem value="back">Back Day 🏋️</SelectItem>
                      <SelectItem value="arm">Arm Day 💪</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddWorkout}>Add Workout</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gym Calendar 🗓️</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date(date)}
                onSelect={(newDate) => newDate && setDate(newDate.toISOString().split('T')[0])}
                className="rounded-md border"
                modifiers={{
                  gym: (date) => date.toISOString().split('T')[0] in gymDays
                }}
                modifiersStyles={{
                  gym: { backgroundColor: 'rgba(0, 0, 255, 0.1)', color: 'blue', fontWeight: 'bold' }
                }}
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Workout Summary 📊</h3>
                <ul>
                  {Object.entries(gymDays).map(([date, type]) => (
                    <li key={date} className="mb-1">
                      {date}: {type.charAt(0).toUpperCase() + type.slice(1)} Day
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sleep">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sleep Tracker 😴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Duration (hours)</label>
                  <Input type="number" min="0" max="24" step="0.5" id="sleepDuration" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality (1-10)</label>
                  <Input type="number" min="1" max="10" id="sleepQuality" />
                </div>
              </div>
              <Button onClick={() => {
                const duration = parseFloat((document.getElementById('sleepDuration') as HTMLInputElement).value);
                const quality = parseInt((document.getElementById('sleepQuality') as HTMLInputElement).value);
                handleSleepSubmit(duration, quality);
              }}>Log Sleep</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sleep History 📊</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {sleepData.map((sleep, index) => (
                  <li key={index} className="mb-2">
                    {sleep.date}: {sleep.duration} hours, Quality: {sleep.quality}/10
                    {sleep.quality >= 8 && <span className="ml-2">😴</span>}
                    {sleep.quality < 5 && <span className="ml-2">😫</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="study">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Study Tracker 📚</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input type="text" id="subject" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <Input type="number" min="0" step="0.5" id="studyDuration" />
                </div>
              </div>
              <Button onClick={() => {
                const subject = (document.getElementById('subject') as HTMLInputElement).value;
                const duration = parseFloat((document.getElementById('studyDuration') as HTMLInputElement).value);
                handleSubjectWorkSubmit(subject, duration);
              }}>Log Study Session</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Study History 📊</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {subjectWork.map((work, index) => (
                  <li key={index} className="mb-2">
                    {work.subject}: {work.duration} hours
                    {work.subject.toLowerCase().includes('math') && <span className="ml-2">🧮</span>}
                    {work.subject.toLowerCase().includes('science') && <span className="ml-2">🧪</span>}
                    {work.subject.toLowerCase().includes('literature') && <span className="ml-2">📚</span>}
                    {work.subject.toLowerCase().includes('history') && <span className="ml-2">🏛️</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="homework">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Homework 📝</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input type="text" id="homeworkSubject" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input type="text" id="homeworkDescription" />
                </div>
              </div>
              <Button onClick={() => {
                const subject = (document.getElementById('homeworkSubject') as HTMLInputElement).value;
                const description = (document.getElementById('homeworkDescription') as HTMLInputElement).value;
                handleHomeworkSubmit(subject, description);
              }}>Add Homework</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Homework List 📚</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {homework.map((hw, index) => (
                  <li key={index} className="mb-2 flex items-center space-x-2">
                    <Checkbox
                      id={`homework-${index}`}
                      checked={hw.completed}
                      onCheckedChange={() => handleHomeworkToggle(index)}
                    />
                    <label
                      htmlFor={`homework-${index}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        hw.completed ? 'line-through' : ''
                      }`}
                    >
                      {hw.subject}: {hw.description}
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="goals">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Goal 🎯</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                  <Input type="text" id="goalField" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input type="text" id="goalDescription" />
                </div>
              </div>
              <Button onClick={() =>
                {
                  const field = (document.getElementById('goalField') as HTMLInputElement).value;
                  const description = (document.getElementById('goalDescription') as HTMLInputElement).value;
                  handleGoalSubmit(field, description);
                }}>Add Goal</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Goals List 🏆</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {goals.map((goal, index) => (
                  <li key={index} className="mb-2 flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${index}`}
                      checked={goal.completed}
                      onCheckedChange={() => handleGoalToggle(index)}
                    />
                    <label
                      htmlFor={`goal-${index}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        goal.completed ? 'line-through' : ''
                      }`}
                    >
                      {goal.field}: {goal.description}
                    </label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard 🏆</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {leaderboard.map((entry, index) => (
                  <li key={index} className="mb-2 flex items-center justify-between">
                    <span>{index + 1}. {entry.username}</span>
                    <span>{entry.routineCount} routines</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}