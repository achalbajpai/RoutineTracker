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
import { Lock, Unlock, Calendar as CalendarIcon, Rocket, Medal, Moon, Dumbbell } from 'lucide-react'

export function AllInOneDailyTracker() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [date, setDate] = useState('')
  const [routine, setRoutine] = useState('')
  const [nextDayRoutine, setNextDayRoutine] = useState('')
  const [tasks, setTasks] = useState([])
  const [routineDays, setRoutineDays] = useState([])
  const [workoutType, setWorkoutType] = useState('')
  const [gymDays, setGymDays] = useState({})

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
    loadRoutine(today)
    loadRoutineDays()
    loadGymDays()
  }, [])

  const loadRoutine = (selectedDate) => {
    const storedRoutine = localStorage.getItem(`routine_${selectedDate}`)
    const storedTasks = JSON.parse(localStorage.getItem(`tasks_${selectedDate}`) || '[]')
    if (storedRoutine) setRoutine(storedRoutine)
    setTasks(storedTasks)
  }

  const loadRoutineDays = () => {
    const storedDays = Object.keys(localStorage).filter(key => key.startsWith('routine_'))
    setRoutineDays(storedDays.map(key => key.replace('routine_', '')))
  }

  const loadGymDays = () => {
    const storedGymDays = localStorage.getItem('gymDays')
    if (storedGymDays) {
      setGymDays(JSON.parse(storedGymDays))
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'secret') {
      setIsLoggedIn(true)
    } else {
      alert('Incorrect password')
    }
  }

  const handleRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(`routine_${date}`, routine)
    const parsedTasks = routine.split('\n').filter(line => line.includes(':') && !line.startsWith('>'))
    setTasks(parsedTasks.map(task => ({ text: task, completed: false })))
    localStorage.setItem(`tasks_${date}`, JSON.stringify(parsedTasks.map(task => ({ text: task, completed: false }))))
    loadRoutineDays()
    alert('Routine saved!')
  }

  const handleNextDayRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayString = nextDay.toISOString().split('T')[0]
    localStorage.setItem(`routine_${nextDayString}`, nextDayRoutine)
    loadRoutineDays()
    alert('Next day routine saved!')
  }

  const handleTaskToggle = (index) => {
    const newTasks = [...tasks]
    newTasks[index].completed = !newTasks[index].completed
    setTasks(newTasks)
    localStorage.setItem(`tasks_${date}`, JSON.stringify(newTasks))
  }

  const handleAddWorkout = () => {
    if (date && workoutType) {
      const updatedGymDays = { ...gymDays, [date]: workoutType }
      setGymDays(updatedGymDays)
      localStorage.setItem('gymDays', JSON.stringify(updatedGymDays))
      alert('Workout added successfully!')
    }
  }

  const formatRoutine = (text) => {
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
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Login to Your Daily Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              <Lock className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Your All-In-One Daily Tracker
            <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
              <Unlock className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              loadRoutine(e.target.value)
            }}
            className="mb-4"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="routine">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="routine">
            <Rocket className="mr-2 h-4 w-4" /> Daily Routine
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" /> Routine Calendar
          </TabsTrigger>
          <TabsTrigger value="gym">
            <Dumbbell className="mr-2 h-4 w-4" /> Gym Tracker
          </TabsTrigger>
        </TabsList>
        <TabsContent value="routine">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Daily Routine</CardTitle>
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
              <CardTitle>Your Routine for {date}</CardTitle>
            </CardHeader>
            <CardContent>
              {formatRoutine(routine)}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Task Completion</CardTitle>
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
              <CardTitle>Next Day Routine</CardTitle>
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
              <CardTitle>Routine Calendar</CardTitle>
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
              <CardTitle>Add Gym Workout</CardTitle>
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
                      <SelectItem value="leg">Leg Day</SelectItem>
                      <SelectItem value="chest">Chest Day</SelectItem>
                      <SelectItem value="back">Back Day</SelectItem>
                      <SelectItem value="arm">Arm Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddWorkout}>Add Workout</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gym Calendar</CardTitle>
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
                <h3 className="text-lg font-semibold mb-2">Workout Summary</h3>
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
      </Tabs>
    </div>
  )
}