import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from '../components/Navbar';
import './profile.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fid = localStorage.getItem('fid') || "0";
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    axios
      .get(`${baseURL}/faculty/get_profile.php?fid=${fid}`)
      .then((res) => {
        console.log(res.data.name);
        setProfile({
          name: res.data.name,
          email: res.data.email,
          password: "", // Don’t show password, only on update
        });
      });
  }, [fid, baseURL]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.post(`${baseURL}/faculty/update_profile.php`, {
        fid,
        ...profile,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <>
    <Navbar />
    <div className="profile-container text-center">
      <img
        src={`${process.env.REACT_APP_API_BASE_URL}/profile.png`}
        alt="Profile"
        className="profile-picture mb-3"
      />

      <h2>My Profile</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={profile.name}
        onChange={handleChange}
        className="form-control mb-2"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={profile.email}
        onChange={handleChange}
        className="form-control mb-2"
      />
      <button onClick={handleUpdate} className="btn btn-primary">
        Update Profile
      </button>
    </div>
    </>
  );
};

export default ProfilePage;
