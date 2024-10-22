import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import { GrUserNew } from "react-icons/gr";
import { Input } from "@/components/ui/input";
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
import MotionBtn from "@/components/motionWrapper/MotionBtn";
import MotionLink from "@/components/motionWrapper/MotionBtn";
import { userLogin } from "@/services/apis/userApi";

// Constant valus for returning message.
const successMsg = "Login successfully, will redirect you to Homepage!";
const errorMsg = "Login failed, please try again!";
const oauthApiAddress = "http://localhost:3000/api/user/oauth/";
const oauthBtnSize = 48;

// The validation schema for Login form.
const formSchema = z.object({
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
});

// The Login Form.
const LoginForm = () => {
  const navigate = useNavigate();
  // The function to set user from the global context.
  const { setUser } = useUser();
  // The response info from server.
  const [resInfo, setResInfo] = useState({});

  // Apply the validation schema to the form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // The submit handler.
  const onSubmit = async (values) => {
    try {
      // Clear the potential previous message.
      setResInfo({});

      // Submit the form.
      const user = await userLogin(values.username, values.password);

      // Reset the form and set the msg.
      form.reset();
      setResInfo({
        type: "ok",
        msg: successMsg,
      });

      // Save the user to global context.
      setUser(user);
      // Redirect to the homepage.
      navigate("/");
    } catch (error) {
      console.log(error);
      // Reset the password and set the error message.
      form.setValue("password", "");
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Login"}
        </Button>
      </form>
      <ResInfo resInfo={resInfo} />
    </Form>
  );
};

// Deal with the Oauth Login.
const OauthBtns = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-8">
        <a href={`${oauthApiAddress}google`}>
          <MotionBtn>
            <FcGoogle size={oauthBtnSize} />
          </MotionBtn>
        </a>
        <a href={`${oauthApiAddress}github`}>
          <MotionBtn>
            <IoLogoGithub size={oauthBtnSize} />
          </MotionBtn>
        </a>
        <div>|</div>
        <a href="/user/register">
          <MotionBtn>
            <GrUserNew size={oauthBtnSize} />
          </MotionBtn>
        </a>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-xs">
          By clicking the above buttons, you may register an account.
        </p>
        <p className="text-xs">
          {" "}
          By doing so, you acknowledge that you have read and agree to our{" "}
          <Link to="/termspolicy" className="inline-block underline">
            <MotionLink>
              Terms of Service, Privacy Policy, and Cookies Policy
            </MotionLink>
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

// The component includes the Login Form, Oauth Btns.
const Content = () => {
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <LoginForm />
      <OauthBtns />
    </div>
  );
};

// The login page.
// If the user is logged in, redirect to the user management page.
const Login = () => {
  const { user } = useUser();

  // Redirect to the user management page if the user is already logged in.
  if (user && user.id) return <Navigate to="/user/management" />;

  return (
    <MainWrapper title="Login">
      <Content />
    </MainWrapper>
  );
};

export default Login;
