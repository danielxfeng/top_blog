import React from "react";
import { Link } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { useUser } from "@/contexts/userContext";
import MotionBtn from "@/components/motionWrapper/MotionBtn";
import TextAvatar from "@/components/TextAvatar";
import { logout } from "@/services/apis/userApi";

const UserBtn = () => {
  // The get user from the user context.
  const { user } = useUser();
  const iconProps = { size: 24 };

  // The logout function.
  const handleLogout = () => {
    logout();
  };

  // Display username and the logout button if the user is logged in.
  // Otherwise, display the login button.
  return user && user.id ? (
    <div className="flex justify-center items-center gap-1">
      <MotionBtn>
        <CiLogout
          {...iconProps}
          onClick={handleLogout}
          data-testid={"logout"}
        />
      </MotionBtn>
      <MotionBtn>
        <Link to="/user/management">
          <TextAvatar text={user.username} />
        </Link>
      </MotionBtn>
    </div>
  ) : (
    <MotionBtn>
      <Link to="/user/login">
        <CiUser {...iconProps} />
      </Link>
    </MotionBtn>
  );
};

export default UserBtn;
