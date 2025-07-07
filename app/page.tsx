"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronUp, ChevronDown, User, Search, ArrowUpDown, Sun, Moon, Mail } from "lucide-react"

interface Comment {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

type SortField = "postId" | "name" | "email"
type SortDirection = "asc" | "desc" | null

interface DashboardState {
  searchTerm: string
  currentPage: number
  pageSize: number
  sortField: SortField | null
  sortDirection: SortDirection
}

export default function Dashboard() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<DashboardState>({
    searchTerm: "",
    currentPage: 1,
    pageSize: 10,
    sortField: null,
    sortDirection: null,
  })

  const [darkMode, setDarkMode] = useState(false)

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("dashboardState")
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(parsed)
      } catch (error) {
        console.error("Error parsing saved state:", error)
      }
    }
  }, [])

  // Save state to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("dashboardState", JSON.stringify(state))
  }, [state])

  // Fetch comments data
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/comments")
        const data = await response.json()
        setComments(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching comments:", error)
        setLoading(false)
      }
    }

    fetchComments()
  }, [])

  // Filter and sort comments
  useEffect(() => {
    let filtered = [...comments]

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (comment) =>
          comment.name.toLowerCase().includes(searchLower) ||
          comment.email.toLowerCase().includes(searchLower) ||
          comment.body.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    if (state.sortField && state.sortDirection) {
      filtered.sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (state.sortField) {
          case "postId":
            aValue = a.postId
            bValue = b.postId
            break
          case "name":
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case "email":
            aValue = a.email.toLowerCase()
            bValue = b.email.toLowerCase()
            break
          default:
            return 0
        }

        if (aValue < bValue) return state.sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return state.sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    setFilteredComments(filtered)
  }, [comments, state.searchTerm, state.sortField, state.sortDirection])

  const handleSearch = (value: string) => {
    setState((prev) => ({
      ...prev,
      searchTerm: value,
      currentPage: 1,
    }))
  }

  const handlePageSizeChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      pageSize: Number.parseInt(value),
      currentPage: 1,
    }))
  }

  const handleSort = (field: SortField) => {
    setState((prev) => {
      if (prev.sortField === field) {
        // Cycle through: asc -> desc -> null
        if (prev.sortDirection === "asc") {
          return { ...prev, sortDirection: "desc" }
        } else if (prev.sortDirection === "desc") {
          return { ...prev, sortField: null, sortDirection: null }
        }
      }
      // New field or no sort -> asc
      return { ...prev, sortField: field, sortDirection: "asc" }
    })
  }

  const getSortIcon = (field: SortField) => {
    if (state.sortField !== field) {
      return (
        <div className="flex items-center justify-center w-4 h-4">
          <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      )
    }
    if (state.sortDirection === "asc") {
      return (
        <div className="flex items-center justify-center w-4 h-4">
          <ChevronUp className="h-4 w-4 text-blue-600 font-bold" />
        </div>
      )
    }
    if (state.sortDirection === "desc") {
      return (
        <div className="flex items-center justify-center w-4 h-4">
          <ChevronDown className="h-4 w-4 text-blue-600 font-bold" />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center w-4 h-4">
        <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredComments.length / state.pageSize)
  const startIndex = (state.currentPage - 1) * state.pageSize
  const endIndex = startIndex + state.pageSize
  const currentComments = filteredComments.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }))
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(state.currentPage - 1)}
        disabled={state.currentPage === 1}
        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 disabled:hover:transform-none disabled:hover:shadow-none"
      >
        Previous
      </Button>,
    )

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={state.currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className={`transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
            state.currentPage === 1
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600"
          }`}
        >
          1
        </Button>,
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>,
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={state.currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
            state.currentPage === i
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600"
          }`}
        >
          {i}
        </Button>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500 dark:text-gray-400">
            ...
          </span>,
        )
      }
      pages.push(
        <Button
          key={totalPages}
          variant={state.currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className={`transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
            state.currentPage === totalPages
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600"
          }`}
        >
          {totalPages}
        </Button>,
      )
    }

    // Next button
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(state.currentPage + 1)}
        disabled={state.currentPage === totalPages}
        className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 disabled:hover:transform-none disabled:hover:shadow-none"
      >
        Next
      </Button>,
    )

    return pages
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Comments Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage and view all comments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark
                  </>
                )}
              </Button>
              <Link href="/profile">
                <Button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Comments
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or content..."
                    value={state.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Page Size */}
              <div className="w-full lg:w-48">
                <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Results per page
                </label>
                <Select value={state.pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span>-
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(endIndex, filteredComments.length)}
                </span>{" "}
                of <span className="font-semibold text-gray-900 dark:text-white">{filteredComments.length}</span>{" "}
                comments
                {state.searchTerm && (
                  <span className="text-blue-600 dark:text-blue-400"> (filtered from {comments.length} total)</span>
                )}
              </div>
              {state.sortField && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sorted by <span className="font-medium capitalize">{state.sortField}</span>{" "}
                  <span className="font-medium">{state.sortDirection === "asc" ? "↑" : "↓"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Mobile Card View - Only visible on small screens */}
            <div className="block lg:hidden">
              {currentComments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-gray-400 mb-2">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No comments found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {currentComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Post #{comment.postId}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          ID: {comment.id}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm leading-relaxed">
                        {comment.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <p className="text-sm text-blue-600 dark:text-blue-400 truncate font-medium">{comment.email}</p>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View - Only visible on large screens */}
            <div className="hidden lg:block">
              {/* Scrollable table wrapper */}
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <Table className="min-w-[800px]">
                    <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-30 shadow-sm backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                      <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                        <TableHead
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none transition-all duration-200 group font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[100px]"
                          onClick={() => handleSort("postId")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">Post ID</span>
                            <div className="ml-2 flex-shrink-0">
                              {state.sortField === "postId" ? (
                                state.sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              )}
                            </div>
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none transition-all duration-200 group font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">Name</span>
                            <div className="ml-2 flex-shrink-0">
                              {state.sortField === "name" ? (
                                state.sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              )}
                            </div>
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 select-none transition-all duration-200 group font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[200px]"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">Email</span>
                            <div className="ml-2 flex-shrink-0">
                              {state.sortField === "email" ? (
                                state.sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                )
                              ) : (
                                <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              )}
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-200 py-4 px-6 min-w-[300px]">
                          Comment
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentComments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <div className="text-gray-400 mb-3">
                              <Search className="h-12 w-12 mx-auto" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No comments found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentComments.map((comment) => (
                          <TableRow
                            key={comment.id}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
                          >
                            <TableCell className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {comment.postId}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium py-4 px-6">
                              <div className="truncate text-gray-900 dark:text-white" title={comment.name}>
                                {comment.name}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="truncate text-blue-600 dark:text-blue-400" title={comment.email}>
                                {comment.email}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div
                                className="line-clamp-2 text-gray-600 dark:text-gray-300 leading-relaxed"
                                title={comment.body}
                              >
                                {comment.body}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                    <p>
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(endIndex, filteredComments.length)}</span> of{" "}
                      <span className="font-semibold">{filteredComments.length}</span> results
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-1 overflow-x-auto pb-2 sm:pb-0 px-2 sm:px-0">
                      <div className="flex items-center space-x-1 min-w-max">{renderPagination()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
