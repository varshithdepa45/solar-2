# Frontend Testing Guide

Complete guide for testing Firebase integration with unit tests, integration tests, and end-to-end tests.

## Setup

### Install Testing Dependencies

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @vitest/ui
npm install --save-dev @firebase/testing firebase-jest-setup
```

### Update `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Unit Tests

### Testing `useAuth()` Hook

Create `__tests__/auth.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/auth-context';
import { AuthProvider } from '@/lib/auth-context';

describe('useAuth', () => {
  it('should return loading initially', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should login user', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
  });

  it('should handle login error', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrong');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  it('should logout user', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
```

---

### Testing Firestore Hooks

Create `__tests__/firestore.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePredictions, useCreatePrediction } from "@/lib/useFirestore";

describe("usePredictions", () => {
  it("should return predictions", async () => {
    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(Array.isArray(result.current.predictions)).toBe(true);
  });

  it("should handle errors", async () => {
    // Mock auth to be unauthenticated
    const { result } = renderHook(() => usePredictions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
  });
});

describe("useCreatePrediction", () => {
  it("should create prediction", async () => {
    const { result } = renderHook(() => useCreatePrediction());

    const predId = await act(async () => {
      return await result.current.createPrediction({
        userId: "test-user",
        endpoint: "solar_forecast",
        input: { latitude: 37.7749, longitude: -122.4194 },
        result: { forecast_value: 150 },
      });
    });

    expect(predId).toBeDefined();
    expect(typeof predId).toBe("string");
  });

  it("should validate input", async () => {
    const { result } = renderHook(() => useCreatePrediction());

    await expect(
      result.current.createPrediction({
        userId: "test-user",
        endpoint: "invalid_endpoint" as any,
        input: {},
        result: {},
      }),
    ).rejects.toThrow();
  });
});
```

---

### Testing Cloud Functions

Create `__tests__/firebase-functions.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import {
  predictSolarForecast,
  analyzeRoof,
  predictSavings,
} from "@/lib/firebase-functions";

describe("Cloud Functions", () => {
  describe("predictSolarForecast", () => {
    it("should return forecast", async () => {
      const result = await predictSolarForecast({
        latitude: 37.7749,
        longitude: -122.4194,
        month: 6,
      });

      expect(result.forecast_value).toBeDefined();
      expect(result.confidence_interval).toBeDefined();
      expect(Array.isArray(result.confidence_interval)).toBe(true);
      expect(result.confidence_interval.length).toBe(2);
    });

    it("should validate latitude", async () => {
      await expect(
        predictSolarForecast({
          latitude: 100, // Invalid
          longitude: -122.4194,
          month: 6,
        }),
      ).rejects.toThrow("latitude");
    });

    it("should validate month", async () => {
      await expect(
        predictSolarForecast({
          latitude: 37.7749,
          longitude: -122.4194,
          month: 13, // Invalid
        }),
      ).rejects.toThrow("month");
    });
  });

  describe("predictSavings", () => {
    it("should return savings data", async () => {
      const result = await predictSavings({
        systemSize: 8,
        latitude: 37.7749,
        roofArea: 200,
      });

      expect(result.annual_savings).toBeGreaterThan(0);
      expect(result.payback_period_years).toBeGreaterThan(0);
      expect(result.npv_25_years).toBeDefined();
      expect(result.co2_offset_tons).toBeGreaterThan(0);
    });

    it("should provide monthly breakdown", async () => {
      const result = await predictSavings({
        systemSize: 8,
        latitude: 37.7749,
        roofArea: 200,
      });

      expect(result.monthly_breakdown).toBeDefined();
      expect(result.monthly_breakdown.length).toBe(12);

      result.monthly_breakdown.forEach((month) => {
        expect(month.month).toBeGreaterThanOrEqual(1);
        expect(month.month).toBeLessThanOrEqual(12);
        expect(month.generation_kwh).toBeGreaterThan(0);
      });
    });
  });

  describe("analyzeRoof", () => {
    it("should return roof analysis", async () => {
      // Use a test image URL
      const result = await analyzeRoof({
        imageUrl: "https://example.com/roof.jpg",
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(result.suitability).toBeGreaterThanOrEqual(0);
      expect(result.suitability).toBeLessThanOrEqual(1);
      expect(result.bounding_boxes).toBeDefined();
      expect(Array.isArray(result.bounding_boxes)).toBe(true);
    });
  });
});
```

---

### Testing Cloud Storage

Create `__tests__/firebase-storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  uploadRoofImage,
  deleteFile,
  getStorageRef,
} from "@/lib/firebase-storage";

describe("Cloud Storage", () => {
  describe("uploadRoofImage", () => {
    it("should upload image", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const url = await uploadRoofImage("test-user", file);

      expect(url).toBeDefined();
      expect(typeof url).toBe("string");
      expect(url).toContain("firebasestorage");
    });

    it("should track progress", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const progressTracker = vi.fn();

      await uploadRoofImage("test-user", file, progressTracker);

      expect(progressTracker).toHaveBeenCalled();

      const calls = progressTracker.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.progress).toBe(100);
    });

    it("should validate file type", async () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" });

      await expect(uploadRoofImage("test-user", file)).rejects.toThrow();
    });

    it("should validate file size", async () => {
      // Create 11MB file
      const largeData = new Uint8Array(11 * 1024 * 1024);
      const file = new File([largeData], "large.jpg", { type: "image/jpeg" });

      await expect(uploadRoofImage("test-user", file)).rejects.toThrow();
    });
  });

  describe("deleteFile", () => {
    it("should delete file", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const url = await uploadRoofImage("test-user", file);

      // Extract path from URL
      const path = url.split("%2F").slice(2).join("/").split("?")[0];

      await deleteFile(path);

      // File should no longer be accessible
      await expect(fetch(url)).rejects.toThrow();
    });
  });
});
```

---

## Integration Tests

### Component Integration Test

Create `__tests__/LoginPage.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset auth state
  });

  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should allow user to login', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByText(/sign in/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  it('should display error on failed login', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByText(/sign in/i);

    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  it('should show Google login button', () => {
    render(<LoginPage />);

    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });
});
```

---

## End-to-End Tests

Using Playwright for E2E testing.

### Install E2E Testing

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Create E2E Test

Create `tests/e2e/auth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should signup new user", async ({ page }) => {
    await page.goto("http://localhost:3000/signup");

    // Fill form
    await page.fill('input[name="email"]', "newuser@example.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("http://localhost:3000/dashboard");
  });

  test("should login existing user", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL("http://localhost:3000/dashboard");
  });

  test("should logout user", async ({ page }) => {
    // Login first
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button:has-text("Sign In")');

    // Click logout
    await page.click('button:has-text("Sign Out")');

    // Should redirect to login
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});
```

### Create Solar Estimation E2E Test

Create `tests/e2e/solar-estimation.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Solar Estimation", () => {
  test("should complete solar estimation", async ({ page }) => {
    await page.goto("http://localhost:3000/solar-estimation-example");

    // Fill form
    await page.fill('input[name="latitude"]', "37.7749");
    await page.fill('input[name="longitude"]', "-122.4194");
    await page.selectOption("select", "6");
    await page.fill('input[name="systemSize"]', "8");
    await page.fill('input[name="roofArea"]', "200");

    // Submit
    await page.click('button:has-text("Get Estimation")');

    // Wait for results
    await expect(page.locator("text=kWh")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=$")).toBeVisible();

    // Verify forecast results
    const forecast = page.locator("text=Monthly Generation");
    await expect(forecast).toBeVisible();

    // Verify savings results
    const savings = page.locator("text=Annual Savings");
    await expect(savings).toBeVisible();
  });
});
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Run with coverage
npm test:coverage

# Run with UI
npm test:ui
```

### E2E Tests

```bash
# Start dev server first
npm run dev

# Run E2E tests
npx playwright test

# Run specific test
npx playwright test auth.spec.ts

# Debug mode
npx playwright test --debug
```

---

## Test Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### `tests/setup.ts`

```typescript
import "@testing-library/jest-dom";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// Initialize Firebase for testing
const app = initializeApp({
  projectId: "test-project",
  apiKey: "test-api-key",
  appId: "test-app-id",
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, "us-central1");

// Connect to emulators
connectAuthEmulator(auth, "http://localhost:9099", {
  disableWarnings: true,
});
connectFirestoreEmulator(db, "localhost", 8080);
connectStorageEmulator(storage, "localhost", 9199);
connectFunctionsEmulator(functions, "localhost", 5001);
```

---

## Coverage Reports

View coverage:

```bash
npm test:coverage

# Open HTML report
open coverage/index.html
```

---

## Best Practices

1. **Test edge cases** - Invalid inputs, network errors, permissions
2. **Mock external services** - Mock Firebase during unit tests
3. **Use emulators** - Integration and E2E tests use Firebase emulators
4. **Test user flows** - E2E tests should cover complete user journeys
5. **Isolate tests** - Each test should be independent
6. **Clean up** - Reset state between tests

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install
        run: cd frontend && npm install

      - name: Unit Tests
        run: cd frontend && npm test

      - name: E2E Tests
        run: cd frontend && npm run test:e2e
```

---

## Troubleshooting

### Tests timeout

```bash
# Increase timeout
npm test -- --testTimeout=10000
```

### Emulator not starting

```bash
# Check if emulators are running
firebase emulators:start
```

### Module not found

```bash
# Clear cache
rm -rf node_modules/.vite
npm test
```

---

## See Also

- [Testing Library Docs](https://testing-library.com/)
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Firebase Testing Guide](https://firebase.google.com/docs/emulator-suite)
