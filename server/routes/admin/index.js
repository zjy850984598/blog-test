module.exports = (app) => {
  const express = require('express')
  const assert = require('http-assert')
  const jwt = require('jsonwebtoken')
  const AdminUser = require('../../models/AdminUser')
  const sendEmail = require('../../plugins/sendEmail.js')
  const router = express.Router({
    mergeParams: true,
  })
  router.post('/', async (req, res) => {
    const model = await req.Model.create(req.body)
    res.send(model)
  })
  router.put('/:id', async (req, res) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
    res.send(model)
  })
  router.delete('/:id', async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body)
    res.send({
      success: true,
    })
  })
  router.get('/', async (req, res) => {
    const queryOptions = {}
    if (req.Model.modelName === 'Category') {
      queryOptions.populate = 'parent'
    }
    const items = await req.Model.find().setOptions(queryOptions).limit(100)
    res.send(items)
  })
  router.get('/:id', async (req, res) => {
    const model = await req.Model.findById(req.params.id)
    res.send(model)
  })

  //登录校验中间件
  const authMiddleware = require('../../middleware/auth')

  //资源中间件
  const resourceMiddleware = require('../../middleware/resource')

  //资源路由
  app.use(
    '/admin/api/rest/:resource',
    authMiddleware(),
    resourceMiddleware(),
    router
  )

  /* //用于阿里云oss图片上传
  const multer = require('multer')
  const MAO = require('multer-aliyun-oss')
  const upload = multer({
    storage: MAO({
      config: {
        region: 'your region', // 阿里云oss的所在区域，比如oss-cn-shenzhen
        accessKeyId: 'your accessKeyId', // 阿里云oss的accessKeyId，要自己去创建
        accessKeySecret: 'your accessKeySecret', // 阿里云oss的accessKeySecret
        bucket: 'your bucket name', // 阿里云oss的bucket's name
      },
    }),
  })
  app.post(
    '/admin/api/upload',
    authMiddleware(),
    upload.single('file'),
    async (req, res) => {
      const file = req.file
      res.send(file)
    }
  )*/

  //本地图片上传
  const multer = require('multer')
  const upload = multer({
    dest: __dirname + '/../../uploads',
  })
  app.post(
    '/admin/api/upload',
    authMiddleware(),
    upload.single('file'),
    async (req, res) => {
      const file = req.file
      file.url = `http://localhost:3000/uploads/${file.filename}`
      res.send(file)
    }
  )

  // 第一次登录把注册注释取消
  app.post('/admin/api/register', async (req, res) => {
    const { username, password } = req.body
    const isHave = await AdminUser.findOne({
      username,
    })
    if (isHave) {
      res.send({
        ok: false,
        message: '用户已存在',
      })
      return
    }
    const user = await AdminUser.create({
      username,
      password,
    })
    res.send({
      ok: true,
      data: user,
    })
  })

  //登录
  app.post('/admin/api/login', async (req, res) => {
    const { username, password } = req.body
    const user = await AdminUser.findOne({
      username,
    }).select('+password')
    if (!user) {
      res.send({
        ok: false,
        message: '用户不存在',
      })
      return
    }
    const isValid = require('bcryptjs').compareSync(password, user.password)
    if (!isValid) {
      res.send({
        ok: false,
        message: '密码错误',
      })
      return
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      app.get('secret')
    )
    res.send({
      ok: true,
      data: {
        token,
        username,
      },
    })
  })

  app.post('/admin/api/email', async (req, res) => {
    sendEmail(req.body)
    res.send({
      ok: 'ok',
    })
  })

  //错误处理函数
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    })
  })
}
