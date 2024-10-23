import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { MdOutlineDeleteForever } from "react-icons/md";
import ResInfo from "@/components/ResInfo";
import MainWrapper from "@/components/MainWrapper";
import { Button } from "@/components/motionWrapper/MotionButton";
import { useUser } from "@/contexts/userContext";
import MotionBtn from "@/components/motionWrapper/MotionBtn";
import {
  getUserInfo,
  updateUserInfo,
  deleteUser,
  getOauthLoginLink,
} from "@/services/apis/userApi";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Constant valus for returning message.
const successMsg =
  "User information updated successfully, will redirect you to Homepage!";
const errorMsg = "Update failed, please try again!";
const oauthApiAddress = "http://localhost:3000/api/user/oauth/";
const oauthBtnSize = 48;

// The Manage Form.
const ManageForm = ({ userInfo }) => {
  const navigate = useNavigate();
  // The function to set user from the global context.
  const { user, setUser } = useUser();
  const [resInfo, setResInfo] = useState({});

  // The validation schema for Login form.
  const formSchema = z
    .object({
      username: z
        .string()
        .min(6, { message: "Username must be between 6 and 64 characters" })
        .max(64, { message: "Username must be between 6 and 64 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, {
          message:
            "Username must be alphanumeric characters, and '_' or '-' are allowed",
        })
        .optional()
        .or(z.literal("")),

      password: z
        .string()
        .min(6, { message: "Password must be between 6 and 64 characters" })
        .max(64, { message: "Password must be between 6 and 64 characters" })
        .optional()
        .or(z.literal("")),

      confirmPassword: z
        .string()
        .min(6, { message: "Password must be between 6 and 64 characters" })
        .max(64, { message: "Password must be between 6 and 64 characters" })
        .optional()
        .or(z.literal("")),
    })
    .refine((data) => data.username !== user.username, {
      message: "Username unchanged",
      ["path"]: ["username"],
    })
    .refine(
      (data) => !data.password || data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        ["path"]: ["confirmPassword"],
      }
    )
    .refine((data) => data.username || data.password, {
      message: "Cannot update with empty fields",
      ["path"]: ["username", "password"],
    });

  // Apply the validation schema to the form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: userInfo.username || "",
      password: "",
      comfirmPassword: "",
    },
  });

  // The Update handler.
  const onUpdate = async (values) => {
    try {
      // Clear the potential previous message.
      setResInfo({});

      const username = values.username ? { username: values.username } : {};
      const password = values.password ? { password: values.password } : {};
      const payload = { ...username, ...password };

      if (!payload.username && !payload.password)
        throw new Error("No changes to update.");
      // Submit the form.
      const updatedUser = await updateUserInfo(payload);

      // Reset the form and set the msg.
      form.reset();
      setResInfo({
        type: "ok",
        msg: successMsg,
      });

      // Save the user to global context.
      setUser(updatedUser);
      // Redirect to the homepage.
      navigate("/");
    } catch (error) {
      console.log(error);
      // Reset the password and set the error message.
      form.resetField("password");
      form.resetField("confirmPassword");
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
        onSubmit={form.handleSubmit(onUpdate)}
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
                <Input {...field} />
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Update"}
        </Button>
      </form>
      <ResInfo resInfo={resInfo} />
    </Form>
  );
};

// Deal with the Oauth Login.
const OauthBtns = ({ userInfo }) => {
  const { setUser } = useUser();
  const [resInfo, setResInfo] = useState({});
  const navigate = useNavigate();

  // The Delete handler.
  const onDelete = async () => {
    try {
      setResInfo({});
      await deleteUser();
      setResInfo({ type: "ok", msg: successMsg });
      setUser({});
      navigate("/");
    } catch (error) {
      console.log(error);
      setResInfo({ type: "error", msg: errorMsg });
    }
  };

  return (
    <div className="flex items-center gap-8">
      {userInfo.oauths.some((oauth) => oauth.provider === "google") ? (
        <FcGoogle size={oauthBtnSize} opacity={0.3} />
      ) : (
        <MotionBtn
          onClick={() => {
            window.location.href = getOauthLoginLink("google");
          }}
        >
          <FcGoogle size={oauthBtnSize} />
        </MotionBtn>
      )}
      {userInfo.oauths.some((oauth) => oauth.provider === "github") ? (
        <IoLogoGithub size={oauthBtnSize} opacity={0.3} />
      ) : (
        <MotionBtn
          onClick={() => {
            window.location.href = getOauthLoginLink("github");
          }}
        >
          <IoLogoGithub size={oauthBtnSize} />
        </MotionBtn>
      )}
      <div>|</div>;
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <MotionBtn>
            <MdOutlineDeleteForever size={oauthBtnSize} />
          </MotionBtn>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ResInfo resInfo={resInfo} />
    </div>
  );
};

// The component includes the management Form, Oauth Btns.
const Content = () => {
  // The user info.
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  // Fetch the user info.
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        // Update only when the user info is not empty to avoid infinite loop.
        if (userInfo && userInfo.id) setUserInfo(userInfo);
      } catch (error) {
        console.log(error);
        // Redirect to Login page when the user info is not available.
        navigate("/user/login");
      }
    };

    fetchUserInfo();
  }, []);

  if (!userInfo || !userInfo.id) return <div>Loading...</div>;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <ManageForm userInfo={userInfo} />
      <OauthBtns userInfo={userInfo} />
    </div>
  );
};

// The User Management page.
// If the user is not logged in, redirect to the login page.
const UserManagement = () => {
  const { user } = useUser();
  // Redirect to the login page if the user is not logged in.
  if (!user || !user.id) return <Navigate to="/user/login" />;

  return (
    <MainWrapper title="User Management">
      <Content />
    </MainWrapper>
  );
};

export default UserManagement;
