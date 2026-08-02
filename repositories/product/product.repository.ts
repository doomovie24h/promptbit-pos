import {
  db,
} from "@/lib/db/prisma";








export class ProductRepository {








  async findManyByStore(

    storeId:string

  ){



    return db.product.findMany({


      where:{


        storeId,


      },



      orderBy:{


        name:"asc",


      },



      include:{


        category:true,


      },


    });



  }












  async findById(


    id:string,


    storeId:string



  ){



    return db.product.findFirst({



      where:{


        id,


        storeId,



      },



      include:{


        category:true,


      },



    });



  }













  async create(


    data:{


      name:string;


      price:number;


      categoryId:string;


      storeId:string;



    }



  ){



    return db.product.create({



      data,



      include:{


        category:true,


      },


    });



  }













  async update(


    id:string,


    storeId:string,


    data:{


      name:string;


      price:number;


      categoryId:string;



    }



  ){





    return db.product.update({




      where:{


        id,


      },




      data,




      include:{


        category:true,


      },



    });



  }












  async delete(


    id:string


  ){



    return db.product.delete({



      where:{


        id,


      },


    });



  }












  async countByCategory(


    categoryId:string,


    storeId:string



  ){



    return db.product.count({



      where:{


        categoryId,


        storeId,


      },


    });



  }





}