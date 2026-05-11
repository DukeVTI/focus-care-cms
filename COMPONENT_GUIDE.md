# FocusCMS Component Guide

**Purpose:** Standardize component usage across the platform for consistency and faster onboarding.

---

## shadcn/ui Components - Usage Guide

### Form Components

#### **Input**
```typescript
// ✅ DO: Use for simple text fields
<Input
  placeholder="Search..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// ❌ DON'T: Use for complex form validation (use Form wrapper instead)
```

#### **Select**
```typescript
// ✅ DO: Use for predefined options
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => (
      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
    ))}
  </SelectContent>
</Select>

// ❌ DON'T: Use for dynamic/searchable lists with 50+ items (use combobox)
```

#### **Switch**
```typescript
// ✅ DO: Use for boolean toggles (on/off, enabled/disabled)
<div className="flex items-center justify-between">
  <Label>Action Required</Label>
  <Switch checked={action} onCheckedChange={setAction} />
</div>

// ❌ DON'T: Use for multiple options (use radio group or select)
```

#### **Textarea**
```typescript
// ✅ DO: Use for longer text input (notes, descriptions)
<Textarea
  placeholder="Enter detailed notes..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  maxLength={500}
/>

// ✅ DO: Always set maxLength for safeguarding text fields
```

---

### Display Components

#### **Card**
```typescript
// ✅ DO: Use Card as the primary container for content sections
<Card className="hover:shadow-md transition-all">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>

// ✅ DO: Add hover effects and transitions for interactive cards
// ❌ DON'T: Nest Cards inside Cards (use CardContent divs instead)
```

#### **Badge**
```typescript
// ✅ DO: Use for status/category labels
<Badge variant="destructive">Escalated</Badge>
<Badge variant="secondary">Pending Review</Badge>

// Supported variants: "default" | "secondary" | "destructive" | "outline"

// ✅ DO: Add icons for clarity
<Badge variant="destructive" className="gap-1">
  <AlertTriangle className="h-3 w-3" />
  Action Required
</Badge>

// ❌ DON'T: Use as buttons (use Button instead)
```

#### **Dialog**
```typescript
// ✅ DO: Use for confirmations, forms, detailed views
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Optional description</DialogDescription>
    </DialogHeader>
    {/* Form or content */}
    <div className="space-y-4 pt-4">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>

// ✅ DO: Use max-width constraints and scrollable content
//<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
// ❌ DON'T: Use for simple alerts (use toast instead)
```

#### **Tabs**
```typescript
// ✅ DO: Use for switching between related content sections
<Tabs defaultValue="overview" className="space-y-4">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  <TabsContent value="details">
    {/* Details content */}
  </TabsContent>
</Tabs>

// ✅ DO: Keep tab content symmetric in complexity
// ❌ DON'T: Use for navigation (use Router instead)
```

---

### Feedback Components

#### **Toast (via Sonner)**
```typescript
// ✅ DO: Use for quick feedback (success, error, info)
import { toast } from "sonner";

// Success
toast.success("Document uploaded successfully");

// Error
toast.error("Failed to delete document");

// Info
toast.info("Document duplicate detected");

// ✅ DO: Keep messages brief and actionable
// ❌ DON'T: Use for long-running operations (use Dialog with progress instead)
```

#### **AlertDialog**
```typescript
// ✅ DO: Use for destructive actions (delete, archive)
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// ✅ DO: Always use for any destructive action
// ✅ DO: Make cancel the explicit action (not default)
```

---

### Layout Components

#### **Pagination**
```typescript
// ✅ DO: Use for large lists/tables
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        onClick={goToPrevious}
        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
      />
    </PaginationItem>
    
    {pageNumbers.map(page => (
      <PaginationItem key={page}>
        <PaginationLink
          onClick={() => setCurrentPage(page)}
          isActive={page === currentPage}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}
    
    <PaginationItem>
      <PaginationNext 
        onClick={goToNext}
        className={currentPage === maxPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>

// ✅ DO: Disable prev/next when at boundaries
// ✅ DO: Use for 25+ items (this is a good threshold)
```

---

## Custom Component Patterns

### Page Headers

```typescript
// Every page should have consistent header structure
<div>
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold mb-2">Page Title</h1>
      <p className="text-muted-foreground">Brief description</p>
    </div>
    {cta && (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Create New
      </Button>
    )}
  </div>
</div>
```

### Stat Cards

```typescript
// Display key metrics at page top
<div className="grid gap-4 md:grid-cols-4">
  {stats.map(stat => (
    <Card
      key={stat.key}
      className="cursor-pointer hover:shadow-md transition-all"
      onClick={() => navigate(stat.link)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {stat.title}
          </span>
          <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
        </div>
        <p className="text-3xl font-bold">{stat.value}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Empty States

```typescript
// Always show contextual empty states
<Card className="text-center py-12">
  <CardContent className="pt-6">
    <EmptyIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No items found</h3>
    <p className="text-muted-foreground mb-4">
      You haven't created anything yet. Get started by creating your first item.
    </p>
    <Button onClick={handleCreate}>
      <Plus className="h-4 w-4 mr-2" />
      Create Item
    </Button>
  </CardContent>
</Card>
```

### Loading States

```typescript
// Return null during loading (pages handle their own loading)
if (loading || loadingData) {
  return null;
}

// Use skeleton components for more complex layouts
import { Skeleton } from "@/components/ui/skeleton";

<div className="space-y-4">
  {[...Array(3)].map((_, i) => (
    <Card key={i}>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  ))}
</div>
```

---

## Color & Styling Guidelines

### Semantic Color Usage

```typescript
// Status colors
destructive  → Danger/Escalation/Delete (red)
warning      → Caution/Pending/Overdue (orange/yellow)
success      → Complete/Approved/Active (green)
primary      → Default/Info/Primary action (blue)
secondary    → Alternative/Disabled/Secondary (gray)
```

### CSS Class Patterns

```typescript
// ✅ DO: Use margin/padding utilities consistently
<div className="space-y-4 mb-8">
  {items.map(item => <Item key={item.id} data={item} />)}
</div>

// ✅ DO: Use responsive grid layouts
<div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ✅ DO: Use hover/transition effects on interactive elements
className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"

// ❌ DON'T: Use arbitrary color values (e.g., text-red-500)
// Use semantic tokens instead: text-destructive
```

---

## Accessibility Checklist

- ✅ All form inputs have associated labels
- ✅ All buttons have descriptive text or aria-label
- ✅ Dialogs have proper focus management
- ✅ Color is not the only way to convey information
- ✅ Interactive elements are keyboard accessible
- ✅ Error messages are announced to screen readers

---

## Common Patterns

### Fetching Data with React Query

```typescript
// ✅ DO: Use consistent query key patterns
const { data, isLoading, error } = useQuery({
  queryKey: ['young-people', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('young_people')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
});

if (isLoading) return null;
if (error) {
  toast.error('Failed to load data');
  return null;
}
```

### Form Submission Pattern

```typescript
// ✅ DO: Use consistent submission flow
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  try {
    const { error } = await supabase.from('table').insert(data);
    if (error) throw error;
    
    toast.success('Successfully saved');
    onSuccess?.();
  } catch (err: any) {
    toast.error(err.message || 'Save failed');
  } finally {
    setIsSubmitting(false);
  }
};

<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

---

## Questions?

If you're unsure about component usage, check:
1. This guide (patterns & examples)
2. Existing similar features in the codebase
3. shadcn/ui documentation: https://ui.shadcn.com
4. Ask in code review

**Remember:** Consistency > Perfection. Follow established patterns in the codebase.
