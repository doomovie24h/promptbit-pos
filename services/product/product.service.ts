import {
  ProductRepository,
} from "@/repositories/product/product.repository";





const productRepository =
  new ProductRepository();







export class ProductService {






  async getProducts(

    storeId:string

  ){


    return productRepository.findManyByStore(
      storeId
    );


  }









  async getProductById(

    storeId:string,

    id:string

  ){


    return productRepository.findById(

      id,

      storeId

    );


  }











  async createProduct(


    storeId:string,


    data:{


      name:string;


      price:number;


      categoryId:string;


    }


  ){





    if(

      !data.name ||

      !data.categoryId

    ){


      throw new Error(

        "Missing product data"

      );


    }






    if(

      Number(data.price) < 0

    ){


      throw new Error(

        "Invalid price"

      );


    }








    return productRepository.create({


      name:data.name,


      price:Number(data.price),


      categoryId:data.categoryId,


      storeId,



    });




  }













  async updateProduct(


    storeId:string,


    id:string,


    data:{


      name:string;


      price:number;


      categoryId:string;



    }



  ){





    const existing =

      await productRepository.findById(

        id,

        storeId

      );







    if(!existing){


      throw new Error(

        "Product not found"

      );


    }









    return productRepository.update(


      id,


      storeId,


      {


        name:data.name,


        price:Number(data.price),


        categoryId:data.categoryId,


      }



    );




  }














  async deleteProduct(


    storeId:string,


    id:string



  ){





    const existing =

      await productRepository.findById(


        id,


        storeId



      );







    if(!existing){


      throw new Error(

        "Product not found"

      );


    }








    return productRepository.delete(

      id

    );



  }







}