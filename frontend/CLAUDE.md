# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Basic Response Rules

- Use English for all documentation content. Use Traditional Chinese for communication with users.

## Code Quality Standards

- **Formatting and Linting**: Always run the formatting and linting commands specified in the project's README.md after any code changes:
  - Use `npm run format` for code formatting
  - Use `npm run lint` for code linting and auto-fixes
  - Ensure all code passes these checks before committing
- **Application**: These standards apply to all development activities including coding, testing, and API development.

## Development Prerequisites

- **MANDATORY**: Adhere to all development flows, error handling standards, time zone processing requirements, and testing practices defined in the guide
- **MANDATORY**: Follow the 9-step API development process as outlined in the guide to ensure consistency and quality
- **MANDATORY**: Implement all error handling patterns, especially standardized authentication error messages and timezone handling using dayjs.utc()

## Coding Guidelines

- **Before starting development**, follow the systematic documentation-driven approach defined in the Documentation & Quality Workflow section below.
- **Project Initialization Phase**: Check and invoke Automatic Documentation Generation Rules to generate root & module documentation files before coding begins.
- Before writing new code, review all relevant internal (non-third-party) dependencies. If reusable methods exist, prioritize their use to avoid duplication.
- Plan each method's implementation in advance and explain its purpose. Break down each method into step-by-step tasks and request my approval before proceeding with implementation.
- Ensure code is testable, adheres to clean code principles, maintains high cohesion and low coupling, and is easily readable.
- For complex design patterns, evaluate the actual complexity and maintainability of the target feature to avoid over-engineering.
- Every method must log both its input and output using `logger.debug`.
- All logger messages must follow the format: `[Method] log message` to enable quick identification of the method source.
- Controllers are responsible for orchestrating calls across multiple services and composing the final response structure.
- When adding new features, avoid modifying existing legacy code.
- When modifying existing code, do not refactor until the modification is complete. If refactoring is deemed necessary, you must obtain my approval and provide the rationale along with the updated control flow.
- Each method must be documented using JSDoc-compliant annotations.
- Code must comply with SonarLint rules.
- Code must adhere to the linting configuration defined in the project.
- All `throw Error` statements must be preceded by `logger.error()` to record the error details before throwing.
- **Automatic Documentation Maintenance**: Every code change must trigger automatic documentation updates. If documentation files don't exist, they will be automatically generated based on the patterns defined in the Documentation & Quality Workflow section below.
- After any implementation or modification, follow the Code Quality Standards defined above.
- While respecting the above rules, mimic the project's existing code style as closely as possible.

## Unit Testing Guidelines

- Run the unit test command specified in the project's README.md to verify test results and obtain a coverage report.
- Automatically fix any failing test cases.
- Tests must include both black-box and white-box strategies to ensure edge case coverage.
- Config and Logger dependencies must use actual packages; mocking them is strictly prohibited.
- Coverage target is 100% for unit tests (excludes DTOs and entities as specified in test configuration).
- Do not test logger calls, including frequency or arguments.
- Only validate input parameters, return values, and invocation counts for custom-defined business logic methods.

## Git Commit and Push Guidelines

- After completing any significant development task or feature implementation, create a meaningful commit and push to the remote repository.
- **IMPORTANT: Only commit files that were actually modified during the current task. Never add untracked files unless they are part of the specific task being completed.**
- **API Documentation**: When implementing new API endpoints, ALWAYS ensure API documentation files are included in the commit:
  - Check for `doc/api/` directory files related to the new endpoint
  - Add API documentation files with `git add doc/api/...`
  - Include documentation files in the commit alongside code changes
  - This prevents incomplete commits that are missing essential API documentation
- **Documentation Synchronization**: Automatically generate and update documentation files in commits following the three-tier documentation architecture. See Documentation & Quality Workflow section for detailed requirements.
- Use `git add <specific-files>` to stage both code and documentation files
- Follow the commit message format structure:
  - Start with a conventional commit type: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, etc.
  - Provide a concise but descriptive summary in the subject line
  - Use simple, descriptive commit messages:

```bash
git commit -m "feat: implement feature name - brief description of main changes"
```

- Push commits immediately after creation to maintain remote repository synchronization.
- Use descriptive commit messages that clearly explain the purpose and scope of changes.

### Commit Squashing Guidelines

**MANDATORY**: After completing feature development with multiple fix commits, always squash them into a single comprehensive commit before creating PR.

#### When to Squash Commits:

- After implementing a feature with subsequent bug fixes
- When you have multiple commits for the same logical change (e.g., main implementation + E2E test fixes + unit test fixes + TypeORM query fixes)
- Before creating PR to maintain clean commit history

#### Step-by-Step Commit Squashing Process:

1. **Identify commits to squash**:

   ```bash
   git log --oneline -10  # Review recent commits
   ```

2. **Check for uncommitted changes**:

   ```bash
   git status
   # If there are changes, either commit them first or stash them
   git stash  # if changes are unrelated
   ```

3. **Perform soft reset to base commit**:

   ```bash
   # Reset to the commit BEFORE your feature commits
   git reset --soft <base-commit-hash>
   ```

4. **Verify all changes are staged**:

   ```bash
   git status  # Should show all changes as "Changes to be committed"
   ```

5. **Create comprehensive squashed commit**:

   ```bash
   git commit -m "$(cat <<'EOF'
   feat: descriptive title of the main feature

   - Main implementation details
   - Key technical changes made
   - Bug fixes included (E2E test fixes, unit test fixes, etc.)
   - TypeORM/database query corrections
   - Test coverage improvements
   - API documentation updates

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

6. **Force push with lease protection**:
   ```bash
   git push origin <branch-name> --force-with-lease
   ```

#### Squashing Example:

**Before (multiple commits):**

- `feat: implement GET /v1/orders API`
- `fix: correct E2E test data setup`
- `fix: correct TypeORM query joins`
- `fix: update unit test mocks`

**After (single squashed commit):**

- `feat: completely reimplement GET /v1/orders API with advanced filtering`

#### Benefits of Commit Squashing:

- **Clean History**: Each PR represents one logical change
- **Easier Reviews**: Reviewers see complete change in one commit
- **Better Rollbacks**: Can revert entire feature with single revert
- **Professional Standards**: Maintains high-quality commit history

#### Important Notes:

- **Only squash commits within your feature branch**
- **Never squash commits that have already been merged to main/develop**
- **Always use `--force-with-lease` instead of `--force` to prevent overwriting others' work**
- **Ensure comprehensive commit message covers all changes made**

## Pull Request Guidelines

### Target Branch Rules

- When creating pull requests, follow these target branch rules:
  - **Default target branch**: `develop` (if not specifically specified)
  - **Exception**: If the current branch is already `develop`, set target branch to `main`
  - Always verify the target branch before creating the PR to ensure proper workflow

### PR Creation Process

Follow this systematic process to avoid targeting wrong branches:

1. **Pre-Creation Check**:

   ```bash
   # Check current branch
   git branch --show-current

   # Determine target branch based on rules above
   # If current branch != develop: target = develop
   # If current branch == develop: target = main
   ```

2. **Create PR with Explicit Base**:

   ```bash
   # Always use --base parameter to explicitly specify target branch
   gh pr create --base develop --title "feat: your change summary" --body "detailed description"

   # OR for develop branch
   gh pr create --base main --title "feat: your change summary" --body "detailed description"
   ```

3. **Post-Creation Verification**:
   - Immediately check the created PR URL
   - Verify the target branch is correct
   - If wrong, close the PR and recreate with correct target

### PR Content Requirements

- Use descriptive PR titles that summarize the main changes
- Include comprehensive PR descriptions with:
  - Summary of changes and their purpose
  - Technical implementation details
  - Test coverage and validation results
  - Clear checklist of completed tasks
- Ensure all tests pass and maintain the coverage requirements specified in Testing Guidelines (100% for unit tests, API documentation-based coverage for E2E tests) before creating PR

### Common Mistakes to Avoid

- ❌ Never rely on GitHub's default branch selection
- ❌ Never create PR without `--base` parameter
- ❌ Never assume the target branch is correct without verification
- ✅ Always explicitly specify `--base` parameter
- ✅ Always verify target branch after creation
- ✅ Follow the branch rules systematically

## Development Workflow

follow this systematic approach:

### Analysis and Planning Phase

- **Use TodoWrite tool** to create a task list immediately when receiving development requests
- **Auto-Generate Documentation**: Automatically create documentation files if they don't exist, following the patterns defined in Documentation & Quality Workflow section.
- **Analyze existing module structure** using Glob and Read tools to understand
- **Identify reusable components** to avoid code duplication

## Implementation Phase (Execute in Order)

- Follow existing naming conventions in the project
- Include comprehensive error handling with appropriate exceptions
- Add debug logging for method entry, success, and error cases

## Testing Phase

### Unit Tests

- **Tests**: Mock service dependencies, test endpoint behavior, error handling,test business logic,edge cases, error scenarios
- Include tests for:
  - Successful operations
  - Validation errors
  - Not found scenarios
  - Edge cases (empty data, boundary values)

## Code Quality Assurance

- **Code Quality**: Apply formatting and linting commands to ensure consistent code style

### Code Style Standards for Test Files

**Important**: After writing tests, always apply formatting and linting to ensure proper code formatting:

- **Prettier formatting**: Automatically handles indentation, line breaks, and spacing
- **ESLint fixes**: Automatically applies code style rules including:
  - Function call argument formatting (multi-line when needed)
  - Object property alignment
  - Consistent quote usage
  - Trailing commas and semicolons

**Test-specific formatting patterns:**

- Long function calls should be split across multiple lines
- Method chaining should be properly indented
- Mock setup and expectations should be clearly separated
- Complex objects should use multi-line formatting for readability

## Documentation & Quality Workflow

## Three-Step Core Process

### Step 1: Identify Change Scope

- **Code Changes**: Internal logic, functions, classes
- **Architecture Changes**: Module structure, dependencies, design patterns

### Step 2: Self-Check Quality

- Follow Code Quality Standards defined above

### Step 3: Commit & PR

- Stage both code and documentation files together
- PR description must include changes summary, documentation list

## Automatic Documentation Generation Rules

### Project-Level Documentation Auto-Generation

When starting on a new project (or at root), if the following files are missing:

- README.md
  Then automatically generate them with basic project overview, tech stack and module navigation.

### Module Documentation Auto-Generation Pattern

When creating or modifying modules, automatically generate these files if they don't exist:

#### Architecture Documentation doc/architecture/{module}/)

- **service.md**: Business logic layer implementation
- **module.md**: Module dependencies and configuration

### Documentation Update Patterns

#### Architecture Documentation Updates:

- **module.md**: Update dependencies when module imports change

### Quality Standards for Generated Documentation

#### Content Requirements:

- Include complete examples and use cases
- Maintain consistent formatting and structure
- Include proper cross-references and links

#### Language Requirements:

- Use English for all documentation content
- Follow the established technical writing style
- Include code examples
- Maintain professional tone and clarity

### File Generation Logic

#### Check Existing Files:

1. Scan `doc/architecture/{module}/` for existing files
2. Scan `doc/api/{module}/` for existing files
3. Generate missing files based on patterns
4. Update existing files with new content

## One-Page Quality Checklist

Before every commit, ensure ALL five items are completed:

- [ ] **Code Style**: Follow Code Quality Standards defined above
- [ ] **Documentation**: Auto-generated Project/Module/API docs updated and staged
- [ ] **PR Description**: Contains "Change Summary + Documentation List + Test Results"

## Project Overview

This is a Vue 3 single-page application built with Vite as the build tool. The project uses:

- **Vue 3** with Composition API (`<script setup>` syntax)
- **Vue Router 4** for client-side routing
- **Pinia 3** for state management
- **Tailwind CSS v4** (configured via Vite plugin)
- **Vite 7** as the development server and build tool
- **Axios** for HTTP client and API requests
- **Day.js** for date and time manipulation
- **ECharts 6** for data visualization and charting
- **SweetAlert2** for user notifications
- **jwt-decode** for JWT token decoding
- **ESLint 9** with flat config for code quality

## Development Guidelines

### Code Standards

#### ESLint Configuration

This project uses ESLint 9 with flat config (`eslint.config.js`). The configuration includes:

- **JavaScript**: `@eslint/js` with recommended rules for browser globals
- **Vue 3**: `eslint-plugin-vue` with flat/essential config
- **JSON**: `@eslint/json` for JSON file linting
- **Markdown**: `@eslint/markdown` for markdown file linting (GitHub Flavored Markdown)
- **CSS**: `@eslint/css` for CSS file linting

**Linting Scope**:
- JavaScript/Vue files: `**/*.{js,mjs,cjs,vue}`
- JSON files: `**/*.json`
- Markdown files: `**/*.md`
- CSS files: `**/*.css`

**ESLint Best Practices**:
- Always run linting before commits to ensure code quality
- Fix auto-fixable issues automatically
- Address all linting errors and warnings
- Follow Vue.js and JavaScript recommended practices

#### Date and Time Handling

This project uses **Day.js** (v1.11.19) for all date and time operations:

- **Timezone Handling**: Always use `dayjs.utc()` for consistent timezone handling as specified in Development Prerequisites
- **Lightweight Alternative**: Day.js is used instead of Moment.js for smaller bundle size
- **Immutable**: Day.js objects are immutable, preventing unintended mutations
- **Plugin Support**: Extend functionality with Day.js plugins as needed

**Day.js Usage Examples**:
```javascript
import * as dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

// Enable UTC plugin
dayjs.extend(utc)

// Always use UTC for consistency
const now = dayjs.utc()
const formatted = dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
```

#### Data Visualization with ECharts

This project uses **ECharts** (v6.0.0) for powerful, interactive data visualization:

- **Rich Chart Types**: Line, bar, pie, scatter, candlestick, graph, tree, and more
- **Interactive**: Built-in zoom, tooltip, legend, data view, and restore tools
- **Responsive**: Automatic resize and mobile-friendly
- **Customizable**: Extensive theming and styling options
- **Performance**: Optimized for large datasets with progressive rendering
- **TypeScript Support**: Full type definitions included

**ECharts Basic Usage**:
```javascript
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref } from 'vue'

// In Vue component
const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  // Initialize chart
  chartInstance = echarts.init(chartRef.value)

  // Define chart options
  const option = {
    title: {
      text: 'Sales Statistics'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Sales',
        type: 'line',
        data: [150, 230, 224, 218, 135, 147, 260]
      }
    ]
  }

  // Set options and render
  chartInstance.setOption(option)

  // Handle resize
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
})

onUnmounted(() => {
  // Clean up
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', chartInstance.resize)
})
```

**ECharts in Vue Components**:
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  chartInstance = echarts.init(chartRef.value)

  const option = {
    title: {
      text: 'Revenue Overview',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Revenue',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'Product A' },
          { value: 735, name: 'Product B' },
          { value: 580, name: 'Product C' },
          { value: 484, name: 'Product D' },
          { value: 300, name: 'Product E' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)

  // Auto resize
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>
```

**Common Chart Types**:
```javascript
// Line Chart
{
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'line',
      data: [120, 200, 150, 80, 70],
      smooth: true  // Smooth curve
    }
  ]
}

// Bar Chart
{
  xAxis: {
    type: 'category',
    data: ['Category A', 'Category B', 'Category C']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [120, 200, 150],
      itemStyle: {
        color: '#5470c6'
      }
    }
  ]
}

// Pie Chart
{
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],  // Donut chart
      data: [
        { value: 335, name: 'Item A' },
        { value: 234, name: 'Item B' },
        { value: 154, name: 'Item C' }
      ]
    }
  ]
}

// Multi-Series Line Chart
{
  legend: {
    data: ['Series 1', 'Series 2']
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Series 1',
      type: 'line',
      data: [120, 132, 101, 134, 90]
    },
    {
      name: 'Series 2',
      type: 'line',
      data: [220, 182, 191, 234, 290]
    }
  ]
}
```

**ECharts with Dynamic Data**:
```javascript
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const chartData = ref([])
const chartRef = ref(null)
let chartInstance = null

onMounted(async () => {
  chartInstance = echarts.init(chartRef.value)

  // Fetch initial data
  await fetchChartData()
})

const fetchChartData = async () => {
  try {
    const response = await axios.get('/api/chart-data')
    chartData.value = response.data
    updateChart()
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
  }
}

const updateChart = () => {
  if (!chartInstance) return

  const option = {
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'line',
        data: chartData.value.map(item => item.value)
      }
    ]
  }

  chartInstance.setOption(option)
}

// Watch for data changes
watch(chartData, () => {
  updateChart()
})
```

**ECharts with Loading State**:
```javascript
import { ref } from 'vue'

const isLoading = ref(true)

const showLoading = () => {
  if (chartInstance) {
    chartInstance.showLoading({
      text: 'Loading...',
      color: '#5470c6',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    })
  }
}

const hideLoading = () => {
  if (chartInstance) {
    chartInstance.hideLoading()
  }
}

const loadData = async () => {
  showLoading()
  try {
    const response = await axios.get('/api/data')
    chartData.value = response.data
    updateChart()
  } finally {
    hideLoading()
  }
}
```

**ECharts Responsive Design**:
```javascript
// Composable for chart resize handling
import { onMounted, onUnmounted } from 'vue'

export function useChartResize(chartInstance) {
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { handleResize }
}

// Usage in component
import { useChartResize } from '@/composables/useChartResize'

const { handleResize } = useChartResize(chartInstance)
```

**ECharts Event Handling**:
```javascript
onMounted(() => {
  chartInstance = echarts.init(chartRef.value)

  // Click event
  chartInstance.on('click', (params) => {
    console.log('Clicked:', params.name, params.value)
    // Handle click event
  })

  // Hover event
  chartInstance.on('mouseover', (params) => {
    console.log('Hovered:', params)
  })

  // Legend select event
  chartInstance.on('legendselectchanged', (params) => {
    console.log('Legend changed:', params.selected)
  })
})
```

**ECharts Theme Customization**:
```javascript
// Register custom theme
const customTheme = {
  color: ['#3398DB', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3'],
  backgroundColor: '#ffffff',
  textStyle: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 12
  },
  title: {
    textStyle: {
      color: '#333333',
      fontSize: 18
    }
  },
  legend: {
    textStyle: {
      color: '#666666'
    }
  }
}

echarts.registerTheme('custom', customTheme)

// Use custom theme
chartInstance = echarts.init(chartRef.value, 'custom')
```

**ECharts Best Practices**:
- Always dispose charts in `onUnmounted` to prevent memory leaks
- Use `ref` for chart DOM elements and maintain chart instances
- Implement responsive design with resize listeners
- Show loading states for async data fetching
- Use appropriate chart types for different data visualizations
- Optimize performance with data sampling for large datasets
- Leverage built-in interactions (zoom, tooltip, legend)
- Use themes for consistent styling across charts
- Handle errors gracefully when data fails to load
- Consider accessibility with proper labels and descriptions

**ECharts Performance Tips**:
```javascript
// For large datasets, use sampling
{
  series: [
    {
      type: 'line',
      data: largeDataArray,
      sampling: 'lttb'  // Largest-Triangle-Three-Buckets algorithm
    }
  ]
}

// Use progressive rendering
{
  series: [
    {
      type: 'scatter',
      large: true,  // Enable large mode
      largeThreshold: 2000,  // Threshold for large mode
      data: hugeDataArray
    }
  ]
}

// Lazy update for better performance
chartInstance.setOption(option, {
  notMerge: true,  // Don't merge with previous option
  lazyUpdate: true  // Lazy update for better performance
})
```

#### HTTP Client with Axios

This project uses **Axios** for all HTTP requests and API communications:

- **Promise-Based**: Modern async/await syntax support
- **Interceptors**: Request and response interceptors for centralized handling
- **Error Handling**: Comprehensive error handling with HTTP status codes
- **Request Cancellation**: Built-in support for aborting requests
- **Automatic JSON Transformation**: Automatic request/response data transformation

**Axios Usage Examples**:
```javascript
import axios from 'axios'

// Basic GET request
const response = await axios.get('/api/users')

// POST request with data
const response = await axios.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// Request with custom config
const response = await axios.get('/api/data', {
  params: { id: 123 },
  headers: { 'Authorization': 'Bearer token' }
})

// Error handling
try {
  const response = await axios.get('/api/data')
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Error status:', error.response.status)
    console.error('Error data:', error.response.data)
  } else if (error.request) {
    // Request made but no response received
    console.error('No response received')
  } else {
    // Error in request setup
    console.error('Request error:', error.message)
  }
}
```

**Axios Best Practices**:
- Create axios instances with custom configurations for different API endpoints
- Use interceptors for common tasks (authentication, logging, error handling)
- Implement proper error handling for network failures and API errors
- Use request cancellation for cleanup in component unmount scenarios

#### JWT Token Handling with jwt-decode

This project uses **jwt-decode** (v4.0.0) for decoding JWT tokens on the client side:

- **Lightweight**: Minimal library with no dependencies
- **Client-Side Only**: Decodes tokens without verification (verification happens server-side)
- **Type Safe**: Full TypeScript support
- **Simple API**: Single function to decode tokens
- **Base64 Decoding**: Safely decodes JWT payload from Base64Url encoding

**jwt-decode Basic Usage**:
```javascript
import { jwtDecode } from 'jwt-decode'

// Decode JWT token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const decoded = jwtDecode(token)

console.log(decoded)
// {
//   sub: '1234567890',
//   name: 'John Doe',
//   iat: 1516239022,
//   exp: 1516242622
// }

// Access specific claims
const userId = decoded.sub
const username = decoded.name
const expirationTime = decoded.exp
```

**jwt-decode with TypeScript**:
```javascript
import { jwtDecode } from 'jwt-decode'

// Define token payload interface
interface JwtPayload {
  sub: string
  name: string
  email: string
  role: string
  iat: number
  exp: number
}

// Decode with type
const token = localStorage.getItem('token')
const decoded = jwtDecode<JwtPayload>(token)

console.log(decoded.email) // Type-safe access
console.log(decoded.role)
```

**jwt-decode Common Patterns**:
```javascript
import { jwtDecode } from 'jwt-decode'

// Check if token is expired
function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000 // Convert to seconds
    return decoded.exp < currentTime
  } catch (error) {
    // Invalid token
    return true
  }
}

// Get token expiration time
function getTokenExpiration(token) {
  try {
    const decoded = jwtDecode(token)
    return new Date(decoded.exp * 1000) // Convert to milliseconds
  } catch (error) {
    return null
  }
}

// Get user info from token
function getUserFromToken(token) {
  try {
    const decoded = jwtDecode(token)
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}

// Check token validity
function isValidToken(token) {
  if (!token) return false

  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    // Check if token has required fields and is not expired
    return decoded.exp && decoded.exp > currentTime
  } catch (error) {
    return false
  }
}
```

**jwt-decode with Pinia Store**:
```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)

  // Computed: Check if user is authenticated
  const isAuthenticated = computed(() => {
    if (!token.value) return false

    try {
      const decoded = jwtDecode(token.value)
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch (error) {
      return false
    }
  })

  // Computed: Get user role from token
  const userRole = computed(() => {
    if (!token.value) return null

    try {
      const decoded = jwtDecode(token.value)
      return decoded.role
    } catch (error) {
      return null
    }
  })

  // Action: Login
  async function login(credentials) {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      const newToken = response.data.token

      // Store token
      token.value = newToken
      localStorage.setItem('token', newToken)

      // Decode and store user info
      const decoded = jwtDecode(newToken)
      user.value = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      }

      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  // Action: Logout
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // Action: Initialize auth from stored token
  function initAuth() {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return

    try {
      const decoded = jwtDecode(storedToken)
      const currentTime = Date.now() / 1000

      // Check if token is still valid
      if (decoded.exp > currentTime) {
        token.value = storedToken
        user.value = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role
        }
      } else {
        // Token expired, clear it
        logout()
      }
    } catch (error) {
      // Invalid token, clear it
      logout()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    initAuth
  }
})
```

**jwt-decode with Axios Interceptors**:
```javascript
// utils/axios.js
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/auth'

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000

        // Check if token is expired
        if (decoded.exp < currentTime) {
          // Token expired, remove it and redirect to login
          localStorage.removeItem('token')
          const authStore = useAuthStore()
          authStore.logout()
          window.location.href = '/login'
          return Promise.reject(new Error('Token expired'))
        }

        // Add valid token to request
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem('token')
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized, clear token and redirect
      localStorage.removeItem('token')
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

**jwt-decode with Vue Router Guards**:
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/pages/AdminView.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth
  const requiresRole = to.meta.requiresRole

  if (requiresAuth) {
    if (!token) {
      // No token, redirect to login
      next('/login')
      return
    }

    try {
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000

      // Check if token is expired
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token')
        next('/login')
        return
      }

      // Check role if required
      if (requiresRole && decoded.role !== requiresRole) {
        next('/unauthorized')
        return
      }

      next()
    } catch (error) {
      // Invalid token
      localStorage.removeItem('token')
      next('/login')
    }
  } else {
    next()
  }
})

export default router
```

**jwt-decode Best Practices**:
- **Client-Side Only**: Never use jwt-decode for token verification; always verify tokens on the server
- **Token Expiration**: Always check token expiration before using it
- **Error Handling**: Wrap jwt-decode calls in try-catch blocks to handle invalid tokens
- **Secure Storage**: Store tokens in httpOnly cookies when possible; use localStorage as a fallback
- **Token Refresh**: Implement token refresh logic before expiration
- **Sensitive Data**: Never store sensitive data in JWT payload (it's not encrypted, only encoded)
- **Validation**: Validate decoded claims before using them
- **Logout on Error**: Clear invalid or expired tokens and redirect to login
- **Type Safety**: Use TypeScript interfaces for token payload structure
- **Security**: Combine with HTTPS to prevent token interception

**Common Token Claims**:
```javascript
// Standard JWT claims
{
  iss: 'issuer',           // Token issuer
  sub: 'subject',          // Subject (usually user ID)
  aud: 'audience',         // Intended audience
  exp: 1234567890,         // Expiration time (seconds since epoch)
  nbf: 1234567890,         // Not before time
  iat: 1234567890,         // Issued at time
  jti: 'token-id'          // JWT ID (unique identifier)
}

// Custom application claims
{
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
}
```

**jwt-decode Error Handling**:
```javascript
import { jwtDecode } from 'jwt-decode'

function safeDecodeToken(token) {
  if (!token) {
    console.error('No token provided')
    return null
  }

  try {
    const decoded = jwtDecode(token)

    // Validate required fields
    if (!decoded.exp || !decoded.sub) {
      console.error('Invalid token structure')
      return null
    }

    return decoded
  } catch (error) {
    if (error.name === 'InvalidTokenError') {
      console.error('Token is malformed:', error.message)
    } else {
      console.error('Error decoding token:', error)
    }
    return null
  }
}
```

#### State Management with Pinia

This project uses **Pinia** (v3.0.4) as the official state management library for Vue 3:

- **Intuitive**: Store, state, getters, and actions - simpler than Vuex
- **Type Safe**: Full TypeScript support with auto-completion
- **Devtools Support**: Integration with Vue Devtools for debugging
- **Modular by Design**: Multiple stores without nested modules
- **Composition API**: Fully compatible with Vue 3 Composition API
- **SSR Support**: Server-side rendering compatible

**Pinia Store Structure**:
```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Option Store (Options API style)
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchData() {
      const response = await axios.get('/api/data')
      this.name = response.data.name
    }
  }
})

// Setup Store (Composition API style) - RECOMMENDED
export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('Eduardo')

  // getters
  const doubleCount = computed(() => count.value * 2)

  // actions
  function increment() {
    count.value++
  }

  async function fetchData() {
    const response = await axios.get('/api/data')
    name.value = response.data.name
  }

  return { count, name, doubleCount, increment, fetchData }
})
```

**Using Stores in Components**:
```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

// Get store instance
const counterStore = useCounterStore()

// Access state with reactivity (RECOMMENDED)
const { count, name, doubleCount } = storeToRefs(counterStore)

// Access actions directly (no need for storeToRefs)
const { increment, fetchData } = counterStore

// Alternative: Direct access (loses reactivity)
// const count = counterStore.count

// Modify state
counterStore.count++
counterStore.$patch({ count: counterStore.count + 1, name: 'New Name' })
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

**Pinia Store Organization**:
```
src/
├── stores/
│   ├── index.js          # Pinia instance creation and export
│   ├── user.js           # User-related state
│   ├── cart.js           # Shopping cart state
│   ├── auth.js           # Authentication state
│   └── settings.js       # Application settings
```

**Pinia Setup in main.js**:
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
```

**Pinia Best Practices**:
- Use Setup Stores (Composition API style) for better composition and reusability
- Always use `storeToRefs()` when destructuring state/getters to maintain reactivity
- Group related state into dedicated stores (e.g., `useUserStore`, `useCartStore`)
- Use actions for any logic that modifies state, especially async operations
- Avoid directly mutating state in components; use actions instead
- Use `$patch` for batch state updates to improve performance
- Keep stores focused on a single responsibility
- Use getters for computed/derived state
- Combine Pinia stores with composables for reusable logic
- Integrate with Vue Router for navigation guards and route-based state management

#### User Notifications with SweetAlert2

This project uses **SweetAlert2** (v11.26.3) for beautiful, responsive, and customizable popup alerts:

- **Modern UI**: Clean and professional alert designs
- **Responsive**: Works on all devices and screen sizes
- **Customizable**: Extensive theming and styling options
- **Promise-Based**: Async/await support for user interactions
- **Accessible**: Keyboard navigation and screen reader support
- **Feature Rich**: Confirmations, inputs, timers, toasts, and more

**SweetAlert2 Basic Usage**:
```javascript
import Swal from 'sweetalert2'

// Simple alert
Swal.fire('Hello!', 'This is a message', 'success')

// Success message
Swal.fire({
  title: 'Success!',
  text: 'Your action was completed successfully',
  icon: 'success',
  confirmButtonText: 'OK'
})

// Error message
Swal.fire({
  title: 'Error!',
  text: 'Something went wrong',
  icon: 'error',
  confirmButtonText: 'Try Again'
})

// Confirmation dialog with promise
const result = await Swal.fire({
  title: 'Are you sure?',
  text: "You won't be able to revert this!",
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'No, cancel!'
})

if (result.isConfirmed) {
  // User clicked confirm
  await deleteItem()
  Swal.fire('Deleted!', 'Your item has been deleted.', 'success')
} else if (result.isDismissed) {
  // User clicked cancel
  Swal.fire('Cancelled', 'Your item is safe', 'info')
}

// Input dialog
const { value: email } = await Swal.fire({
  title: 'Enter your email',
  input: 'email',
  inputLabel: 'Your email address',
  inputPlaceholder: 'example@email.com',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) {
      return 'You need to enter an email!'
    }
  }
})

if (email) {
  Swal.fire(`Your email is: ${email}`)
}

// Toast notification
Swal.fire({
  toast: true,
  position: 'top-end',
  icon: 'success',
  title: 'Saved successfully',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})
```

**SweetAlert2 Common Patterns**:
```javascript
// Loading state
Swal.fire({
  title: 'Loading...',
  html: 'Please wait while we process your request',
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading()
  }
})

// Close the loading alert when done
Swal.close()

// Multiple inputs
const { value: formValues } = await Swal.fire({
  title: 'Multiple inputs',
  html:
    '<input id="swal-input1" class="swal2-input" placeholder="Username">' +
    '<input id="swal-input2" class="swal2-input" placeholder="Email">',
  focusConfirm: false,
  preConfirm: () => {
    return [
      document.getElementById('swal-input1').value,
      document.getElementById('swal-input2').value
    ]
  }
})

// Custom styling
Swal.fire({
  title: 'Custom Styled Alert',
  text: 'This alert has custom colors',
  icon: 'info',
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  background: '#fff',
  backdrop: 'rgba(0,0,0,0.4)'
})

// Auto-close timer
Swal.fire({
  title: 'Auto close alert!',
  html: 'This will close in <b></b> milliseconds.',
  timer: 2000,
  timerProgressBar: true,
  didOpen: () => {
    const b = Swal.getHtmlContainer().querySelector('b')
    const timerInterval = setInterval(() => {
      b.textContent = Swal.getTimerLeft()
    }, 100)
  }
})
```

**SweetAlert2 in Vue Components**:
```vue
<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import axios from 'axios'

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/items/${id}`)
      Swal.fire('Deleted!', 'Your item has been deleted.', 'success')
      // Refresh data or remove from list
    } catch (error) {
      Swal.fire('Error!', 'Failed to delete the item.', 'error')
    }
  }
}

const handleSubmit = async () => {
  // Show loading
  Swal.fire({
    title: 'Saving...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    await axios.post('/api/items', formData)
    Swal.fire('Success!', 'Item saved successfully', 'success')
  } catch (error) {
    Swal.fire('Error!', error.message, 'error')
  }
}
</script>

<template>
  <button @click="handleDelete(itemId)">Delete Item</button>
  <button @click="handleSubmit">Submit</button>
</template>
```

**SweetAlert2 Best Practices**:
- Use appropriate icon types: `success`, `error`, `warning`, `info`, `question`
- Always provide clear, concise messages
- Use confirmations for destructive actions (delete, logout, etc.)
- Show loading states for async operations
- Use toast notifications for non-blocking feedback
- Customize button text to be action-specific (e.g., "Delete" instead of "OK")
- Handle both confirm and cancel cases appropriately
- Use input validation for user input dialogs
- Consider accessibility with keyboard navigation
- Use timers for auto-dismissing notifications

**Common Alert Types**:
```javascript
// Success
Swal.fire('Success!', 'Operation completed', 'success')

// Error
Swal.fire('Error!', 'Something went wrong', 'error')

// Warning
Swal.fire('Warning!', 'Please review your input', 'warning')

// Info
Swal.fire('Info', 'Here is some information', 'info')

// Question
Swal.fire('Question?', 'Would you like to proceed?', 'question')
```

**Common Pinia Patterns**:
```javascript
// Resetting store state
counterStore.$reset()

// Subscribing to state changes
counterStore.$subscribe((mutation, state) => {
  console.log('State changed:', state)
})

// Subscribing to actions
counterStore.$onAction(({ name, store, args, after, onError }) => {
  console.log(`Action "${name}" called with:`, args)

  after((result) => {
    console.log('Action completed with result:', result)
  })

  onError((error) => {
    console.error('Action failed:', error)
  })
})

// Using stores outside components
import { useCounterStore } from '@/stores/counter'
import { createPinia } from 'pinia'

const pinia = createPinia()
const store = useCounterStore(pinia)
```

### Import Standards

- Use ES6 module imports (`import`/`export`)
- Import Axios using: `import axios from 'axios'`
- Import Day.js using: `import * as dayjs from 'dayjs'`
- Import ECharts using: `import * as echarts from 'echarts'`
- Import jwt-decode using: `import { jwtDecode } from 'jwt-decode'`
- Import Pinia using: `import { createPinia } from 'pinia'`
- Import Pinia stores using: `import { useStoreName } from '@/stores/storeName'`
- Import storeToRefs using: `import { storeToRefs } from 'pinia'`
- Import SweetAlert2 using: `import Swal from 'sweetalert2'`
- Import path mapping from project root when configured
- Follow Vue 3 SFC import conventions

## Development Commands

```bash
# Start development server (default port 5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Entry Point

The application bootstraps in [src/main.js](src/main.js):

1. Creates Vue app instance from [App.vue](src/App.vue)
2. Registers Pinia for state management
3. Registers Vue Router
4. Mounts to `#app` div in [index.html](index.html)

### Routing

Router configuration is in [src/router/index.js](src/router/index.js). Currently uses:

- `createWebHistory()` mode (requires server-side configuration for production)
- Empty routes array (commented placeholders exist for future pages)
- No catch-all route defined yet

### Styling

- Global styles: [src/style.css](src/style.css) imports Tailwind CSS via `@import "tailwindcss"`
- Tailwind v4 uses the new Vite plugin (`@tailwindcss/vite`) instead of PostCSS
- Component styles use scoped `<style scoped>` blocks in SFCs

### Configuration

[vite.config.js](vite.config.js) configures two plugins:

1. `@vitejs/plugin-vue` - Vue 3 SFC support
2. `@tailwindcss/vite` - Tailwind CSS v4 integration

## Project Structure

```
src/
├── main.js           # Application entry point
├── App.vue           # Root component
├── style.css         # Global styles with Tailwind import
├── router/
│   └── index.js      # Vue Router configuration
├── stores/           # Pinia state management stores
│   └── index.js      # Pinia instance and store exports
├── utils/            # Utility functions and helpers
├── components/       # Reusable Vue components
├── layouts/          # Layout components (Header, Footer, etc.)
├── pages/            # Page components organized by route
└── assets/           # Static assets (images, etc.)
```

## Key Considerations

### Tailwind CSS v4

This project uses Tailwind CSS v4, which differs from v3:

- Import via `@import "tailwindcss"` in CSS (not the traditional `@tailwind` directives)
- Uses Vite plugin instead of PostCSS plugin
- Configuration is CSS-based rather than `tailwind.config.js`

### Vue Router Setup

The router is initialized but has no active routes. When adding routes:

- Import page components at the top of [src/router/index.js](src/router/index.js)
- Use path alias `@/` if configured, or relative paths from `src/`
- Add a catch-all redirect route for 404 handling

### Build Output

- Development server runs on port 5173 (Vite default)
- Production build outputs to `dist/` directory
- Assets are processed and fingerprinted by Vite
