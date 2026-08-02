"use client";

import {
  useState,
} from "react";

import {
  Input,
} from "@/components/ui/input";

import {
  toast,
} from "sonner";


type EditingCategory = {
  id: string;
  name: string;
};


type Props = {
  onSuccess: () => void;
  editingCategory?: EditingCategory | null;
  onCancelEdit?: () => void;
};



export function CategoryForm({
  onSuccess,
  editingCategory,
  onCancelEdit,
}: Props) {


  const [
    name,
    setName,
  ] = useState(
    editingCategory?.name ?? ""
  );


  const [
    loading,
    setLoading,
  ] = useState(false);



  async function handleSubmit() {

    const trimmedName = name.trim();


    if (!trimmedName) {

      toast.error(
        "Please enter category name"
      );

      return;
    }



    setLoading(true);


    try {

      const isEditing =
        Boolean(editingCategory);



      const response =
        await fetch(

          isEditing
            ? `/api/categories/${editingCategory?.id}`
            : "/api/categories",

          {
            method: isEditing
              ? "PUT"
              : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: trimmedName,
            }),
          }

        );



      const json =
        await response.json();



      if (!response.ok) {

        toast.error(
          json.message ??
          "Something went wrong"
        );

        return;
      }



      toast.success(
        isEditing
          ? "Category updated"
          : "Category created"
      );



      setName("");

      onSuccess();



      if (isEditing) {

        onCancelEdit?.();

      }


    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to save category"
      );


    } finally {

      setLoading(false);

    }

  }




  return (

    <div
      className="
        space-y-4
      "
    >

      <div
        className="
          space-y-2
        "
      >

        <label
          className="
            text-sm
            font-medium
          "
        >
          Category Name
        </label>


        <Input

          value={name}

          onChange={(event) =>
            setName(
              event.target.value
            )
          }

          placeholder="Ex. Coffee"

        />

      </div>



      <div
        className="
          flex
          gap-3
        "
      >

        <button

          disabled={loading}

          onClick={handleSubmit}

          className="
            rounded-xl
            bg-primary
            px-5
            py-3
            font-medium
            text-primary-foreground
            transition
            disabled:opacity-50
          "

        >

          {
            loading
              ? "Saving..."
              : editingCategory
                ? "Update Category"
                : "Create Category"
          }

        </button>



        {
          editingCategory && (

            <button

              disabled={loading}

              onClick={() => {

                setName("");

                onCancelEdit?.();

              }}

              className="
                rounded-xl
                border
                px-5
                py-3
                transition
                hover:bg-muted
                disabled:opacity-50
              "

            >

              Cancel

            </button>

          )
        }


      </div>


    </div>

  );

}