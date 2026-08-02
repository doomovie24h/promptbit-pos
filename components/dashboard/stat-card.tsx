import type {
  LucideIcon,
} from "lucide-react";


type StatCardProps = {

  title: string;

  value: string;

  icon: LucideIcon;

  description?: string;

};


export function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {


  return (

    <div
      className="
        rounded-2xl
        border
        bg-card
        p-5
        shadow-sm
        transition
        hover:shadow-md
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >

            {title}

          </p>


          <h2
            className="
              mt-2
              truncate
              text-3xl
              font-bold
              tracking-tight
            "
          >

            {value}

          </h2>



          {description && (

            <p
              className="
                mt-2
                text-xs
                text-muted-foreground
              "
            >

              {description}

            </p>

          )}


        </div>



        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >

          <Icon
            size={24}
          />

        </div>


      </div>


    </div>

  );

}