const uploadFile = require('../../helpers/S3');
const { createSlidesDAO, getSlidesDAO, getFinalListDAO, getOneSlideDAO, editSlideDAO } = require('./dao');

module.exports = {
    async uploadImage(req, res) {
        const {image,text,order,organizationId} = req.body;
        const extension = image.substring("data:image/".length, image.indexOf(";base64"));
        let newSlide;
        try {
            const {Location : imageUrl } = await uploadFile(image, extension);
            const orderObt = await getFinalListDAO();
            newSlide = {
                imageUrl,
                text,
                order: parseInt(order) || orderObt.dataValues.order,
                organizationId:parseInt(organizationId)
            }
        } catch (error) {
            return res.status(400).json({
                message:'Image could not be uploaded'
            });
        }
        await createSlidesDAO(newSlide).then(data=>{
            return res.status(201).json({
                message:'Slide created'
            });
        }).catch(err=>{
            return res.status(400).json({
                message:'Could not create slide'
            });
        })
    },
    async getSlides(req,res){
        const listSlide = await getSlidesDAO();
        res.status(200).json({
            slides:listSlide
        });
    },
    async getOneSlide(req,res){
        try {
            const slide = await getOneSlideDAO(req.params.id);
            if(slide){
                return res.status(200).json({
                    slide
                })
            }
            return res.status(404).json({
                message:"Slide not found"
            })

        } catch (error) {
            return res.status(500).json({
                message:'Internal server error!'
            })
        }
        
    },
    async editSlide(req,res){
        const {image,text,order,organizationId} = req.body;
        let slideUpdate;
        try {
            await getOneSlideDAO(req.params.id).then(async slide => {
                if(!slide){
                    return res.status(404).json({
                        message:"Slide no exist!"
                    })
                } 
                const orderObt = await getFinalListDAO();
                slideUpdate = {
                    imageUrl:image,
                    text,
                    order: parseInt(order) || orderObt.dataValues.order,
                    organizationId:parseInt(organizationId)
                }
                await editSlideDAO(slideUpdate,req.params.id)
                .then(result=>{
                    return res.status(200).json({
                        message:"Upload slide!"
                    })
                })
                .catch(err=>{
                    return res.status(400).json({
                        message:"Could not upload slide"
                    })
                });
            })    
        } catch (error) {
            return res.status(500).json(error=>{
                error
            })
        }
    }
}
