import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchBar } from "../components/dashboard/search-bar";
import { ResourceGrid } from "../components/dashboard/resource-grid";

describe("SearchBar", () => {
  it("renders with placeholder", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search by title, URL, or notes…")).toBeTruthy();
  });

  it("shows clear button when value is non-empty", () => {
    const onChange = vi.fn();
    render(<SearchBar value="react" onChange={onChange} />);
    const clearBtn = screen.getByRole("button");
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("hides clear button when value is empty", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("accepts custom placeholder", () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search…" />);
    expect(screen.getByPlaceholderText("Search…")).toBeTruthy();
  });
});

describe("ResourceGrid", () => {
  it("renders loading skeletons when isLoading", () => {
    const { container } = render(
      <ResourceGrid resources={[]} isLoading={true} hasFilters={false} />,
    );
    const pulseEls = container.querySelectorAll(".animate-pulse");
    expect(pulseEls.length).toBe(6);
  });

  it("renders empty state without filters", () => {
    render(<ResourceGrid resources={[]} isLoading={false} hasFilters={false} />);
    expect(screen.getByText("No resources yet")).toBeTruthy();
    expect(screen.getByText(/Paste a URL in the bar above/)).toBeTruthy();
  });

  it("renders no-results state with filters active", () => {
    render(<ResourceGrid resources={[]} isLoading={false} hasFilters={true} />);
    expect(screen.getByText("No results found")).toBeTruthy();
    expect(screen.getByText(/Try a different search term/)).toBeTruthy();
  });
});
