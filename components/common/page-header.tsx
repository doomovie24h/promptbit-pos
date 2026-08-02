import type {
  ReactNode,
} from "react";


type PageHeaderProps = {
  title: string;

  description?: string;

  action?: ReactNode;
};


export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {


  return (

    <section
      className="
        flex
        flex-col
        gap-6
        sm:flex-row
        sm:items-start
        sm:justify-between
      "
    >

      <div
        className="
          min-w-0
          space-y-2
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            leading-tight
            tracking-tight
            text-foreground
            md:text-4xl
          "
        >

          {title}

        </h1>


        {description && (

          <p
            className="
              max-w-2xl
              text-sm
              text-muted-foreground
              md:text-base
            "
          >

            {description}

          </p>

        )}

      </div>



      {action && (

        <div
          className="
            flex
            shrink-0
            items-center
          "
        >

          {action}

        </div>

      )}

    </section>

  );

}