"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboardingData } from "../hooks/useOnboardingData";
import { useOnboardingForm } from "../hooks/useOnboardingForm";
import { toast, ToastContainer } from "react-toastify";
import debounce from "lodash.debounce";
import {
  FaClock,
  FaCog,
  FaHandPaper,
  FaHandshake,
  FaKiss,
  FaCamera,
  FaShareAlt,
} from "react-icons/fa";
import Link from "next/link";
import { Interaction, User } from "@prisma/client";
import { format } from "date-fns";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Button from "@/components/Button";

const NextIcon = () => {
  return (
    <svg
      className="w-8 h-8"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.0612 17.0612L13.0612 27.0612C12.7794 27.343 12.3972 27.5013 11.9987 27.5013C11.6002 27.5013 11.218 27.343 10.9362 27.0612C10.6544 26.7794 10.4961 26.3972 10.4961 25.9987C10.4961 25.6002 10.6544 25.218 10.9362 24.9362L19.8749 15.9999L10.9387 7.0612C10.7992 6.92167 10.6885 6.75602 10.613 6.57372C10.5375 6.39141 10.4986 6.19602 10.4986 5.9987C10.4986 5.80137 10.5375 5.60598 10.613 5.42367C10.6885 5.24137 10.7992 5.07573 10.9387 4.9362C11.0782 4.79667 11.2439 4.68599 11.4262 4.61047C11.6085 4.53496 11.8039 4.49609 12.0012 4.49609C12.1985 4.49609 12.3939 4.53496 12.5762 4.61047C12.7585 4.68599 12.9242 4.79667 13.0637 4.9362L23.0637 14.9362C23.2034 15.0757 23.3141 15.2414 23.3896 15.4239C23.4651 15.6063 23.5039 15.8018 23.5036 15.9992C23.5034 16.1966 23.4642 16.3921 23.3883 16.5743C23.3123 16.7565 23.2012 16.922 23.0612 17.0612Z"
        fill="#E8DEF8"
      />
    </svg>
  );
};

interface InteractionWithUser extends Interaction {
  user1: User;
  user2: User;
}

// Define interface for the return type of the interactions map
interface MappedInteraction {
  interactionTimestamp: any;
  updatedAt: any;
  user1Id: string;
  user1Username: string;
  user2Username: string;
  user1Action: string;
  user2Action: string;
  currentUserAction: string;
  otherUserAction: string;
  result: string;
  chatId: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { authenticated, user, ready } = usePrivy();
  const {
    data: onboardingData,
    updateData,
    isLoading,
    error,
  } = useOnboardingData();

  const {
    formData,
    handleChange,
    isLoading: isFormLoading,
  } = useOnboardingForm();
  const [localFormData, setLocalFormData] = useState(formData);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [editingField, setEditingField] = useState<string | null>(null); // State to track which field is being edited
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // State for currentUserId
  
  const [interactions, setInteractions] = useState<MappedInteraction[]>([]);

  // Function to decode the JWT and get the currentUserId

  // -- Update Image -- //
  const [image, setImage] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);

  const deleteOldImage = async (imageUrl: string) => {
    try {
      // Extract the path from the full URL
      const oldImageRef = ref(storage, imageUrl);
      await deleteObject(oldImageRef);
      console.log("Old image deleted successfully");
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw here, as we still want to proceed with the new upload
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 640 || img.height < 640) {
            toast.error("Image is too small. Minimum size is 640x640 pixels.");
          } else {
            setImage(reader.result as string); // Set the image to crop
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  useEffect(() => {
    if (image && imageRef.current) {
      if (cropperRef.current) {
        cropperRef.current.destroy(); // Clean up previous cropper instance
      }
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: 1, // For a square crop (profile pic)
        viewMode: 1,
      });
    }
  }, [image]);
  
  const handleGetCroppedImage = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            setCroppedImage(blob);
            setCroppedPreview(URL.createObjectURL(blob));
            setShowCropper(false);
          }
        }, "image/jpeg");
      }
    }
  };

  
const handlePhotoUpdate = async () => {
  setIsUploadLoading(true);
  try {
    if (!croppedImage) {
      throw new Error("No cropped image available");
    }

    // Convert cropped image to base64
    const reader = new FileReader();
    const fileData = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () =>
        resolve(reader.result?.toString()?.split(",")[1] || "");
      reader.onerror = () => reject("Failed to read file");
      reader.readAsDataURL(croppedImage);
    });

    // Make the API call to the backend to upload the image
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: `images/${Date.now()}.jpg`,
        fileData, // Send the base64 image data
        imageType: "PROFILE", // Assume this is the profile image upload
      }),
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to upload image");
    }

    // Update user data with new photo URL
    updateData({ photo: result.imageUrl });

    toast.success("Profile photo updated successfully!");

    // Clear the cropped preview and image states
    setCroppedPreview("");
    setImage(null);
  } catch (error) {
    toast.error("Failed to upload image.");
  } finally {
    setIsUploadLoading(false);
  }
};
  // -- Update Image END -- //


  const fetchPriorInteractions = async () => {
    try {
      const response = await fetch("/api/interactions");
      if (!response.ok) {
        toast.error("Failed to fetch interactions");
        return;
      }
      const data = await response.json();
      console.log("Prior Interactions:", data);
      // Set the interactions directly, since they are now filtered on the server
      setInteractions(data.interactions);
      setCurrentUserId(data.currentUserId);
    } catch (error) {
      toast.error("Error fetching interactions");
    }
  };
  useEffect(() => {
    // if (currentUserId) {
    fetchPriorInteractions(); // Fetch interactions once we have the currentUserId
    // }
  }, []);

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "username":
        if (!value.trim()) return "Username cannot be empty.";
        if ((value.length < 3) || (value.length > 10)) return "Username must be at least 3 and at most 10 characters.";
        return "";
      case "name":
        if (!value.trim()) return "Name cannot be empty.";
        return "";
      case "bio":
        if (value.length > 200) return "Bio cannot exceed 200 characters.";
        return "";
      default:
        return "";
    }
  };

  const debouncedHandleBlur = useCallback(
    debounce(async (fieldName: string, value: string) => {
    console.log(`Debounced update for ${fieldName} with value: ${value}`); // Debugging line

      try {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));

        const payload: Partial<typeof localFormData> = { [fieldName]: value };
        console.log("Updating User:", payload);
        const response = await fetch("/api/updateUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.errors) {
            setFieldErrors((prev) => ({
              ...prev,
              ...errorData.errors,
            }));
            Object.values(errorData.errors).forEach((msg) => {
              toast.error(msg as string);
              toast.error(msg);
            });
          } else {
            throw new Error(errorData.error || "Failed to update user");
          }
          return;
        }

        const updatedData = await response.json();
        updateData(updatedData);
        toast.success("Profile updated successfully!");
        setEditingField(null);
      } catch (error: any) {
        console.error("Error updating profile:", error);
        toast.error(`Error: ${error.message}`);
      }
    }, 500),
    [localFormData, updateData]
  );

  useEffect(() => {
    console.log("Debounced Blur Effect");
    return () => {
      debouncedHandleBlur.cancel();
    };
  }, [debouncedHandleBlur]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debugging line
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    handleChange(e);
  };

  const handleBlur = (fieldName: string) => {
    const value = localFormData[
      fieldName as keyof typeof localFormData
    ] as string;
    const trimmedValue = value.trim();

    const validationError = validateField(fieldName, trimmedValue);
    if (validationError) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: validationError }));
      toast.error(validationError);
    } else {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }

    console.log(
      `Calling debouncedHandleBlur for ${fieldName} with value: ${trimmedValue}`
    );
    debouncedHandleBlur(fieldName, trimmedValue);
  };
  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!authenticated) {
    return (
      <div className="text-center mt-8 text-white">
        Please log in to view your profile.
      </div>
    );
  }

  const isEditing = (fieldName: string) => editingField === fieldName;

  return (
    <div className="flex flex-col items-center justify-center gap-4 relative">
      <div className="flex flex-col w-[350px] items-center justify-center gap-4 relative">
        <img
          src={onboardingData.photo || undefined}
          className="relative w-[115px] h-[115px] rounded-full border-2 border-solid border-purple-200 rounded-full mx-auto object-cover"
        />

        {!croppedPreview && (
          <>
            <input
              id="photo"
              name="photo"
              type="file"
              onChange={(e) => {
                handleFileChange(e);
                setShowCropper(true);
              }}
              accept="image/*"
              className="w-full text-neutral-800 "
            />

            {showCropper && (
              <div className="">
                <img ref={imageRef} src={image} alt="Source" />
                <Button
                  onClick={handleGetCroppedImage}
                  variant="secondary"
                  text="Crop Image"
                />
              </div>
            )}
          </>
        )}

        {croppedPreview && (
          <div className="">
            <img
              src={croppedPreview}
              alt="Cropped Preview"
              className="rounded-full"
            />
            <Button
              onClick={handlePhotoUpdate}
              loading={isUploadLoading}
              text="Update Photo"
            />
          </div>
        )}
        {/* Username Field */}
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl ">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-sm text-gray-400 font-semibold">Username</div>
            {isEditing("username") ? (
              <input
                type="text"
                name="username"
                value={localFormData.username}
                onChange={handleInputChange}
                onBlur={() => handleBlur("username")}
                className={`w-full mt-1 p-2 rounded text-black text-sm ${
                  fieldErrors.username ? "border-red-500" : "border-gray-300"
                } shadow-md`}
                placeholder="Enter your username"
                aria-label="Username"
                aria-invalid={!!fieldErrors.username}
                aria-describedby={
                  fieldErrors.username ? "username-error" : undefined
                }
                autoFocus
              />
            ) : (
              <div className="flex items-center">
                <p
                  className="text-lg text-white cursor-pointer flex-1"
                  onClick={() => setEditingField("username")}
                >
                  {onboardingData.username || "Not set"}
                </p>
              </div>
            )}
            {fieldErrors.username && (
              <p id="username-error" className="text-red-500 text-sm mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditingField("username")}
            aria-label="Edit Username"
          >
            <NextIcon />
          </button>
        </div>

        {/* Name Field */}
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl ">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-sm text-gray-400 font-semibold">Name</div>
            {isEditing("name") ? (
              <input
                type="text"
                name="name"
                value={localFormData.name}
                onChange={handleInputChange}
                onBlur={() => handleBlur("name")}
                className={`w-full mt-1 p-2 rounded text-black text-sm ${
                  fieldErrors.name ? "border-red-500" : "border-gray-300"
                } shadow-md`}
                placeholder="Enter your name"
                aria-label="Name"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                autoFocus
              />
            ) : (
              <div className="flex items-center">
                <p
                  className="text-lg text-white cursor-pointer flex-1"
                  onClick={() => setEditingField("name")}
                >
                  {onboardingData.name || "Not set"}
                </p>
              </div>
            )}
            {fieldErrors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditingField("name")}
            aria-label="Edit Name"
            className="ml-2 text-yellow-500 hover:text-yellow-600 focus:outline-none"
          >
            <NextIcon />
          </button>{" "}
        </div>

        {/* Bio Field */}
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-sm text-gray-400 font-semibold">Bio</div>
            {isEditing("bio") ? (
              <textarea
                name="bio"
                value={localFormData.bio}
                onChange={handleInputChange}
                onBlur={() => handleBlur("bio")}
                className={`w-full mt-1 p-2 rounded text-black text-sm ${
                  fieldErrors.bio ? "border-red-500" : "border-gray-300"
                } shadow-md`}
                rows={3}
                placeholder="Tell us about yourself"
                aria-label="Bio"
                aria-invalid={!!fieldErrors.bio}
                aria-describedby={fieldErrors.bio ? "bio-error" : undefined}
                autoFocus
              ></textarea>
            ) : (
              <div className="flex items-center">
                <p
                  className="text-lg text-white cursor-pointer flex-1"
                  onClick={() => setEditingField("bio")}
                >
                  {onboardingData.bio || "Not set"}
                </p>
              </div>
            )}
            {fieldErrors.bio && (
              <p id="bio-error" className="text-red-500 text-sm mt-1">
                {fieldErrors.bio}
              </p>
            )}
          </div>
          <button onClick={() => setEditingField("bio")} aria-label="Edit Bio">
            <NextIcon />
          </button>{" "}
        </div>

        {/* Hot Score */}
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-sm text-gray-400 font-semibold">Hot Score</div>
            <div className="flex items-center justify-between border-2 border-[#E8DEF8] rounded-full bg-[#161616] h-[40px]">
              <span className="font-ibm-plex-mono text-white px-2 py-1 text-xs flex items-center">
                🔥 <span className="ml-1">{onboardingData.hotScore}%</span>
              </span>
              <div className="relative w-full bg-gray-300 rounded-full h-[4.5px] ml-2 mr-2">
                <div
                  className="absolute top-0 h-full bg-[#8274E9] rounded-full"
                  style={{ width: `${onboardingData.hotScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Karma Score */}
        <div className="flex w-full max-w-[350px] items-center justify-between px-6 py-4 relative bg-purple-300 bg-opacity-20 rounded-xl">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-sm text-gray-400 font-semibold">
              Karma Score
            </div>
            <div className="flex items-center justify-between border-2 border-[#E8DEF8] rounded-full bg-[#161616] h-[40px]">
              <span className="font-ibm-plex-mono text-white px-2 py-1 text-xs flex items-center">
                👼 <span className="ml-1">{onboardingData.karmaScore}%</span>
              </span>
              <div className="relative w-full bg-gray-300 rounded-full h-[4.5px] ml-2 mr-2">
                <div
                  className="absolute top-0 h-full bg-[#A340B8] rounded-full"
                  style={{ width: `${onboardingData.karmaScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Kissory */}
        <div id="prior-interactions" className="mt-8 mb-8">
          <h2 className="text-2xl text-primary">Prior Interactions</h2>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div> {/* You can replace this with any loading spinner component */}
            </div>
          ) : interactions.length > 0 ? (
            <div className="space-y-4">
              {interactions.map((interaction, idx) => {
                // Determine whether the current user is user1 or user2
                const isCurrentUserUser1 = interaction.user1Id === currentUserId; // Replace with actual user ID
                // Swap actions if the current user is user2 to always show "You" as the current user
                const currentUserAction = isCurrentUserUser1
                  ? interaction.user1Action
                  : interaction.user2Action;
                const otherUserAction = isCurrentUserUser1
                  ? interaction.user2Action
                  : interaction.user1Action;
                const otherUserName = isCurrentUserUser1
                  ? interaction.user2Username
                  : interaction.user1Username;
        
                const isMutualKiss = interaction.result === "MUTUAL_KISS";
                const isMutualSlap = interaction.result === "MUTUAL_SLAP";
                const isKissSlap = interaction.result === "KISS_SLAP";
                const isSlapKiss = interaction.result === "SLAP_KISS";
        
                return (
                  <div
                    key={idx}
                    className="flex w-full items-center justify-between p-4 bg-white rounded-lg shadow-md border border-neutral-200"
                  >
                    <div>
                      <h3 className="text-lg font-medium">
                        {format(
                          new Date(
                            interaction.updatedAt
                              ? interaction.updatedAt
                              : interaction.interactionTimestamp
                          ),
                          "PPpp"
                        )}
                      </h3>
                      <p className="text-sm mt-1">
                        {/* Display the current user's action (always "You") */}
                        {currentUserAction === "KISS" ? (
                          <span className="flex items-center">
                            <FaKiss className="mr-2 text-pink-500" /> You kissed{" "}
                            {otherUserName}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FaHandPaper className="mr-2 text-yellow-500" /> You{" "}
                            slapped {otherUserName}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        {/* Display the result or the other user's action */}
                        {isMutualKiss ? (
                          <span className="text-green-500">Mutual Kiss</span>
                        ) : isMutualSlap ? (
                          <span className="text-red-500">Mutual Slap</span>
                        ) : isKissSlap ? (
                          currentUserAction === "KISS" ? (
                            <span className="text-blue-500">They slapped</span>
                          ) : (
                            <span className="text-blue-500">They kissed</span>
                          )
                        ) : isSlapKiss ? (
                          currentUserAction === "SLAP" ? (
                            <span className="text-blue-500">They kissed</span>
                          ) : (
                            <span className="text-blue-500">They slapped</span>
                          )
                        ) : (
                          <span className="flex items-center text-yellow-400">
                            <FaClock className="mr-2" /> Pending
                          </span>
                        )}
                      </p>
                      {interaction.chatId && (
                        <Link
                          href={`/chat/${interaction.chatId}`}
                          className="text-blue-500 underline"
                        >
                          Go to Chat
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No interactions found.</p>
          )}
        </div>
        </div>
    </div>
  );
}