"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { CommandItem } from "cmdk";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ReportType } from "@prisma/client";

// const reportTypes = {
//   Review: "review",
//   User: "user",
//   Business: "business",
//   Service: "service",
//   Other: "other",
// } as const;

const reportType = Object.keys(ReportType) as [keyof typeof ReportType];

const formSchema = z.object({
  reportType: z.enum(reportType),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(3, "Reason is too short"),
  description: z.string().optional(),
});

export default function ProfileForm() {
  const router = useRouter();
  console.log(reportType);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: reportType[0],
      targetId: "",
      reason: "",
      description: "",
    },
  });

  const createReportMutation = api.report.createReport.useMutation();

  function onSubmit() {
    try {
      const values = form.getValues();
      createReportMutation.mutate({
        reportType: values.reportType,
        targetId: BigInt(values.targetId),
        reason: values.reason,
        description: values.description,
      });
      // toast(
      //   <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //     <code className="text-white">{JSON.stringify(values, null, 2)}</code>
      //   </pre>,
      // );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      <div className="mx-auto max-w-3xl py-10">
        <h3 className="mb-4 text-center text-2xl font-bold">Submit Report</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-3xl space-y-8 py-10"
          >
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Report Type</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? field.value.charAt(0).toUpperCase() +
                              field.value.slice(1)
                            : "Select report type"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search report type..." />
                        <CommandList>
                          <CommandEmpty>No report types found.</CommandEmpty>
                          <CommandGroup>
                            {reportType.map((type) => (
                              <CommandItem
                                key={type}
                                onSelect={() => {
                                  field.onChange(type);
                                  toast(`Report type set to ${type}`);
                                }}
                                className="flex items-center text-sm"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === type
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                {/* <-- This is the single item, e.g. "review" */}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select your report type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Target ID" type="" {...field} />
                  </FormControl>
                  <FormDescription>Enter the Target ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Reason" type="" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your reason for this report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter Description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the description of your report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              onClick={() => {
                toast.success("Report submitted successfully!");
                router.push("/dashboard");
              }}
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
