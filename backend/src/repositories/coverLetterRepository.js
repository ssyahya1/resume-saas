import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createCoverLetter = async({
    userId,
    applicationId,
    content
}) => {
    const { data,error} = await supabaseAdmin
    .from("cover_letters")
    .insert({
        user_id:userId,
        application_id:applicationId,
        content:content

    })
    .select()
    .single();

    if(error){
        throw error;
    }
    return data;
};

export const getCoverLettersByUserId = async(userId) =>{
    const { data, error } = await supabaseAdmin
    .from("cover_letters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};


export const getCoverLetterById = async({coverLetterId, userId}) =>{
    const { data, error } = await supabaseAdmin
    .from("cover_letters")
    .select("*")
    .eq("id", coverLetterId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Cover letter not found", 404);
    }

    throw error;
  }

  return data;

}