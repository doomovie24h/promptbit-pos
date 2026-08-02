"use client";

import {
  Pencil,
  Trash2,
} from "lucide-react";


type Category = {
  id: string;
  name: string;
};


type Props = {
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (category: Category) => void;
};



export function CategoryList({
  categories,
  onDelete,
  onEdit,
}: Props) {


  if (categories.length === 0) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-dashed
          p-10
          text-center
        "
      >

        <p
          className="
            text-sm
            text-muted-foreground
          "
        >
          No categories found
        </p>

      </div>

    );

  }




  return (

    <div
      className="
        space-y-3
      "
    >

      {
        categories.map((category)=>(

          <div
            key={category.id}
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              bg-card
              p-4
            "
          >

            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  truncate
                  font-medium
                "
              >
                {category.name}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-muted-foreground
                "
              >
                Product Category
              </p>

            </div>



            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <button

                type="button"

                onClick={() =>
                  onEdit(category)
                }

                aria-label="Edit category"

                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition
                  hover:bg-muted
                "

              >

                <Pencil
                  size={16}
                />

              </button>




              <button

                type="button"

                onClick={() =>
                  onDelete(category.id)
                }

                aria-label="Delete category"

                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  text-destructive
                  transition
                  hover:bg-destructive/10
                "

              >

                <Trash2
                  size={16}
                />

              </button>


            </div>


          </div>

        ))
      }

    </div>

  );

}