import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ResInfo from "@/components/ResInfo";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MainWrapper from "@/components/MainWrapper";
import { Button } from "@/components/motionWrapper/MotionButton";
import { useUser } from "@/contexts/userContext";
import { userRegister } from "@/services/apis/userApi";
import MotionLink from "../../components/motionWrapper/MotionLink";

// Constant valus for returning message.
const successMsg = "Registration successfully, will redirect you to Homepage!";
const errorMsg = "Registration failed, please try again!";

// The validation schema for Registration form.
const formSchema = z
  .object({
    username: z
      .string()
      .min(6, { message: "Username must be between 6 and 64 characters" })
      .max(64, { message: "Username must be between 6 and 64 characters" })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username must be alphanumeric characters, and '_' or '-' are allowed",
      }),

    password: z
      .string()
      .min(6, { message: "Password must be between 6 and 64 characters" })
      .max(64, { message: "Password must be between 6 and 64 characters" }),

    confirmPassword: z
      .string()
      .min(6, { message: "Password must be between 6 and 64 characters" })
      .max(64, { message: "Password must be between 6 and 64 characters" }),

    consent: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.consent === true, {
    message: "Please agree to the terms and policy",
    path: ["consent"],
  });

// The Register Form.
const RegisterForm = () => {
  const navigate = useNavigate();
  // The response info from server.
  const [resInfo, setResInfo] = useState({});

  // Apply the validation schema to the form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      consent: false,
    },
  });

  // The submit handler.
  const onSubmit = async (values) => {
    try {
      // Clear the potential previous message.
      setResInfo({});

      // Submit the form.
      await userRegister(values.username, values.password);

      // Reset the form and set the msg.
      form.reset();
      setResInfo({
        type: "ok",
        msg: successMsg,
      });

      // Redirect to login homepage.
      navigate("/user/login");
    } catch (error) {
      console.log(error);
      // Reset the password and set the error message.
      form.setValue("password", "");
      form.setValue("confirmPassword", "");
      form.setValue("isSubmitted", false);
      setResInfo({
        type: "error",
        msg: error.message || errorMsg,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full md:w-1/2 flex flex-col items-center gap-8"
      >
        {/**  Username field. */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Mike" {...field} />
              </FormControl>
              <FormDescription>Please input your username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/**  Password field. */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>Please input your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/**  Confirm Password field. */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>Please re-input your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/**  Consent field. */}

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs">
                  By creating an account, you agree to our Terms of Service,
                  Privacy Policy, and Cookies Policy.
                </FormLabel>
                <FormDescription>
                  Please read our{"  "}
                  <Link to="/termspolicy">
                    <MotionLink>
                      Terms of Service, Privacy Policy, and Cookies Policy
                    </MotionLink>
                  </Link>
                  {"  "}
                  page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </form>
      <ResInfo resInfo={resInfo} />
    </Form>
  );
};

// The component includes the Login Form, Oauth Btns.
const Content = () => {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <RegisterForm />
    </div>
  );
};

// The user registration page.
// If the user is logged in, redirect to the user management page.
const Register = () => {
  const { user } = useUser();

  // Redirect to the user management page if the user is already logged in.
  if (user && user.id) return <Navigate to="/user/management" />;

  return (
    <MainWrapper title="Register">
      <Content />
    </MainWrapper>
  );
};

export default Register;
