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
import { Lock, Unlock, UserPlus, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Cookies from 'js-cookie'
import Image from 'next/image'
import { Analytics } from "@vercel/analytics/react"

type User = {
  username: string;
  password: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  profilePicture: string;
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
  profilePicture: string;
}

export default function Component() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
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
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [routineHistory, setRoutineHistory] = useState<{[key: string]: string}>({})
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'last30days' | 'allTime'>('last30days')
  const [showPassword, setShowPassword] = useState(false)
  const [profileData, setProfileData] = useState<User | null>(null)

  useEffect(() => {
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }

    const rememberedUser = Cookies.get('rememberedUser')
    if (rememberedUser) {
      try {
        const { username, password } = JSON.parse(rememberedUser)
        handleLogin(username, password)
      } catch (error) {
        console.error('Error parsing remembered user:', error)
        Cookies.remove('rememberedUser')
      }
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
      loadRoutineHistory()
      updateLeaderboard()
      loadProfileData()
    }
  }, [currentUser, date])

  const handleSignUp = (username: string, password: string) => {
    if (users.some(user => user.username === username)) {
      alert('Username already exists')
      return
    }
    if (!isPasswordComplex(password)) {
      alert('Password must contain at least one number, one uppercase letter, and one symbol')
      return
    }
    const newUser: User = {
      username,
      password,
      name: '',
      age: 0,
      weight: 0,
      height: 0,
      profilePicture: '',
    }
    const newUsers = [...users, newUser]
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
        Cookies.set('rememberedUser', JSON.stringify({ username, password }), { expires: 7 })
      }
      updateLeaderboard()
      loadProfileData()
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
    setCurrentSection(null)
    setProfileData(null)
    Cookies.remove('rememberedUser')
  }

  const isPasswordComplex = (password: string) => {
    const hasNumber = /\d/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return hasNumber && hasUpperCase && hasSymbol
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

  const loadRoutineHistory = () => {
    if (!currentUser) return
    const history: {[key: string]: string} = {}
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${currentUser}_routine_`)) {
        const date = key.replace(`${currentUser}_routine_`, '')
        history[date] = localStorage.getItem(key) || ''
      }
    })
    setRoutineHistory(history)
  }

  const updateLeaderboard = () => {
    const leaderboardData = users.map(user => {
      const routineKeys = Object.keys(localStorage).filter(key => key.startsWith(`${user.username}_routine_`))
      return {
        username: user.username,
        routineCount: routineKeys.length,
        profilePicture: user.profilePicture || '/placeholder.svg?height=50&width=50',
      }
    })
    leaderboardData.sort((a, b) => b.routineCount - a.routineCount)
    setLeaderboard(leaderboardData)
  }

  const loadProfileData = () => {
    if (!currentUser) return
    const user = users.find(u => u.username === currentUser)
    if (user) {
      setProfileData(user)
    }
  }

  const handleDataSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUser) return

    const formData = new FormData(e.currentTarget)
    const newRoutine = formData.get('routine') as string
    const newNextDayRoutine = formData.get('nextDayRoutine') as string
    const newWorkoutType = formData.get('workoutType') as string
    const newSleepDuration = parseFloat(formData.get('sleepDuration') as string)
    const newSleepQuality = parseInt(formData.get('sleepQuality') as string)

    // Update routine
    localStorage.setItem(`${currentUser}_routine_${date}`, newRoutine)
    setRoutine(newRoutine)
    const parsedTasks = newRoutine.split('\n').filter(line => line.includes(':') && !line.startsWith('>'))
    const newTasks = parsedTasks.map(task => ({ text: task, completed: false }))
    setTasks(newTasks)
    localStorage.setItem(`${currentUser}_tasks_${date}`, JSON.stringify(newTasks))

    // Update next day routine
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayString = nextDay.toISOString().split('T')[0]
    localStorage.setItem(`${currentUser}_routine_${nextDayString}`, newNextDayRoutine)
    setNextDayRoutine(newNextDayRoutine)

    // Update gym workout
    if (newWorkoutType) {
      const updatedGymDays = { ...gymDays, [date]: newWorkoutType }
      setGymDays(updatedGymDays)
      localStorage.setItem(`${currentUser}_gymDays`, JSON.stringify(updatedGymDays))
    }

    // Update sleep data
    if (newSleepDuration && newSleepQuality) {
      const newSleepData = [...sleepData, { date, duration: newSleepDuration, quality: newSleepQuality }]
      setSleepData(newSleepData)
      localStorage.setItem(`${currentUser}_sleepData`, JSON.stringify(newSleepData))
    }

    loadRoutineDays()
    loadRoutineHistory()
    updateLeaderboard()
    alert('All data saved successfully!')
  }

  const handleTaskToggle = (index: number) => {
    if (!currentUser) return
    const newTasks = [...tasks]
    newTasks[index].completed = !newTasks[index].completed
    setTasks(newTasks)
    localStorage.setItem(`${currentUser}_tasks_${date}`, JSON.stringify(newTasks))
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

  const getSleepQualityRating = (duration: number) => {
    if (duration >= 7) return 'Good quality sleep'
    if (duration >= 4) return 'Average quality sleep'
    return 'Poor quality sleep'
  }

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUser || !profileData) return

    const formData = new FormData(e.currentTarget)
    const updatedUser: User = {
      ...profileData,
      name: formData.get('name') as string,
      age: parseInt(formData.get('age') as string),
      weight: parseFloat(formData.get('weight') as string),
      height: parseFloat(formData.get('height') as string),
    }

    const newUsers = users.map(u => u.username === currentUser ? updatedUser : u)
    setUsers(newUsers)
    localStorage.setItem('users', JSON.stringify(newUsers))
    setProfileData(updatedUser)
    alert('Profile updated successfully!')
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser || !profileData) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onloadend = () => {
      const updatedUser: User = {
        ...profileData,
        profilePicture: reader.result as string,
      }

      const newUsers = users.map(u => u.username === currentUser ? updatedUser : u)
      setUsers(newUsers)
      localStorage.setItem('users', JSON.stringify(newUsers))
      setProfileData(updatedUser)
      updateLeaderboard()
    }

    reader.readAsDataURL(file)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
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
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      className="bg-gray-100 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                    <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Remember me
                    </label>
                  </div>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">Login</Button>
                </form>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                  <button onClick={() => (document.querySelector('[value="signup"]') as HTMLButtonElement)?.click()} className="text-sm text-gray-900 font-semibold hover:underline">
                    Sign up
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(e.currentTarget.username.value, e.currentTarget.password.value) }} className="space-y-4">
                  <Input name="username" type="text" placeholder="Username" required className="bg-gray-100" />
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      className="bg-gray-100 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Password must contain at least one number, one uppercase letter, and one symbol</p>
                  <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white">Sign Up</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentSection) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Welcome to LifeTrack Pro, {currentUser}!
              <Button variant="outline" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                <Unlock className="mr-2 h-4 w-4" /> Logout
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[
            { emoji: '📅', name: 'Daily Routine', key: 'routine' },
            { emoji: '🗓️', name: 'Calendar', key: 'calendar' },
            { emoji: '💪', name: 'Gym Tracker', key: 'gym' },
            { emoji: '😴', name: 'Sleep Tracker', key: 'sleep' },
            { emoji: '📚', name: 'Study Tracker', key: 'study' },
            { emoji: '📝', name: 'Homework', key: 'homework' },
            { emoji: '🎯', name: 'Goals', key: 'goals' },
            { emoji: '🏆', name: 'Leaderboard', key: 'leaderboard' },
            { emoji: '📜', name: 'Routine History', key: 'history' },
            { emoji: '👤', name: 'Profile', key: 'profile' },
          ].map((section) => (
            <Button
              key={section.key}
              className="h-32 text-4xl flex flex-col items-center justify-center"
              onClick={() => setCurrentSection(section.key)}
            >
              <span>{section.emoji}</span>
              <span className="text-sm mt-2">{section.name}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setCurrentSection(null)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sections
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-100">
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

      {currentSection === 'routine' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Routine 📅</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDataSubmit} className="space-y-4">
                <Select
                  name="existingRoutine"
                  onValueChange={(value) => setRoutine(routineHistory[value] || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an existing routine" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(routineHistory).map((date) => (
                      <SelectItem key={date} value={date}>
                        Routine from {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  name="routine"
                  placeholder="Enter your daily routine"
                  value={routine}
                  onChange={(e) => setRoutine(e.target.value)}
                  rows={10}
                />
                <Textarea
                  name="nextDayRoutine"
                  placeholder="Enter your routine for the next day"
                  value={nextDayRoutine}
                  onChange={(e) => setNextDayRoutine(e.target.value)}
                  rows={10}
                />
                <Select name="workoutType" onValueChange={setWorkoutType} value={workoutType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leg">Leg Day 🦵</SelectItem>
                    <SelectItem value="chest">Chest Day 💪</SelectItem>
                    <SelectItem value="back">Back Day 🏋️</SelectItem>
                    <SelectItem value="arm">Arm Day 💪</SelectItem>
                    <SelectItem value="none">No Workout</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-4">
                  <Input name="sleepDuration" type="number" min="0" max="24" step="0.5" placeholder="Sleep Duration (hours)" />
                  <Input name="sleepQuality" type="number" min="1" max="10" placeholder="Sleep Quality (1-10)" />
                </div>
                <Button type="submit">Save All Data</Button>
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
        </>
      )}

      {currentSection === 'calendar' && (
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
      )}

      {currentSection === 'gym' && (
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
                    {date}: {type === 'none' ? 'No Workout' : `${type.charAt(0).toUpperCase() + type.slice(1)} Day`}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {currentSection === 'sleep' && (
        <Card>
          <CardHeader>
            <CardTitle>Sleep History 📊</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {sleepData.map((sleep, index) => (
                <li key={index} className="mb-2">
                  {sleep.date}: {sleep.duration} hours, Quality: {sleep.quality}/10
                  {' - '}{getSleepQualityRating(sleep.duration)}
                  {sleep.quality >= 8 && <span className="ml-2">😴</span>}
                  {sleep.quality < 5 && <span className="ml-2">😫</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {currentSection === 'study' && (
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
      )}

      {currentSection === 'homework' && (
        <Card>
          <CardHeader>
            <CardTitle>Homework 📝</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const subject = (e.currentTarget.elements.namedItem('subject') as HTMLInputElement).value;
              const description = (e.currentTarget.elements.namedItem('description') as HTMLInputElement).value;
              handleHomeworkSubmit(subject, description);
              e.currentTarget.reset();
            }} className="space-y-4 mb-4">
              <Input name="subject" placeholder="Subject" required />
              <Input name="description" placeholder="Description" required />
              <Button type="submit">Add Homework</Button>
            </form>
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
      )}

      {currentSection === 'goals' && (
        <Card>
          <CardHeader>
            <CardTitle>Goals 🎯</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const field = (e.currentTarget.elements.namedItem('field') as HTMLInputElement).value;
              const description = (e.currentTarget.elements.namedItem('description') as HTMLInputElement).value;
              handleGoalSubmit(field, description);
              e.currentTarget.reset();
            }} className="space-y-4 mb-4">
              <Input name="field" placeholder="Field" required />
              <Input name="description" placeholder="Description" required />
              <Button type="submit">Add Goal</Button>
            </form>
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
      )}

      {currentSection === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-4">Leaderboard 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <Button
                onClick={() => setLeaderboardTimeframe('last30days')}
                className={`mr-2 ${leaderboardTimeframe === 'last30days' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                Last 30 days
              </Button>
              <Button
                onClick={() => setLeaderboardTimeframe('allTime')}
                className={leaderboardTimeframe === 'allTime' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              >
                All-Time
              </Button>
            </div>
            <ul className="space-y-4">
              {leaderboard.map((entry, index) => (
                <li key={index} className="flex items-center space-x-4 p-4 bg-background rounded-lg shadow">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-xl">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      src={entry.profilePicture}
                      alt={`${entry.username}'s profile`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{entry.username}</h3>
                    <p className="text-sm text-muted-foreground">{entry.routineCount} routines</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {currentSection === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Routine History 📜</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(routineHistory).map(([date, routine]) => (
                <div key={date} className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{date}</h3>
                  <div className="bg-white p-3 rounded shadow-sm">
                    {formatRoutine(routine)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentSection === 'profile' && profileData && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Profile 👤</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Image
                  src={profileData.profilePicture || '/placeholder.svg?height=100&width=100'}
                  alt="Profile Picture"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                />
              </div>
              <Input name="name" placeholder="Name" defaultValue={profileData.name} />
              <Input name="age" type="number" placeholder="Age" defaultValue={profileData.age} />
              <Input name="weight" type="number" step="0.1" placeholder="Weight (kg)" defaultValue={profileData.weight} />
              <Input name="height" type="number" step="0.1" placeholder="Height (cm)" defaultValue={profileData.height} />
              <Button type="submit">Update Profile</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}