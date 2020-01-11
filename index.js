//导入项目需要的第三方包
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
//导入nodeJS内置模块
const fs = require("fs");
const path = require("path");

//创建express 服务器
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//利用multer第三方包 multer，初始化一个用于上传form-data 图片的函数，函数名叫upload
const upload = multer({
  dest: path.join(__dirname, "/public/uploads/")
}).single("icon");
//app使用第三方cors实现跨域
app.use(cors());
// --------------------数据增删改查 封装可以复用的-------------------
//  函数封装，根据路径，获取数据
// @param{*}file   文件路径
// @param{*}defaultData 默认返回数据

function getFileData(file = "./json/hero.json", defaultData = []) {
  //同步写法可能会出现读取失败的情况
  try {
    //通过path拼接绝对路径
    const filePath = path.join(__dirname, file);
    //返回出去  //把获取的数据换成JS对象
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    //如果读取失败
    //读取失败返回一个空数组
    return defaultData;
  }
}
//保存数据
function saveFileData(defaultData = [], file = "./json/hero.json") {
  try {
    const filePath = path.join(__dirname, file);
    //写入文件
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2)); //返回值是一个undefined.因此返回true
    //写入文件的时候要变成字符串的形式 //在hero.json缩进2个空格
    return true;
  } catch (error) {
    return false;
  }
}
// let bl = saveFileData({
//   id: 1,
//   name: "小吃货",
//   skill: "吃吃吃",
//   icon: "xxx"
// });
// if (bl) {
//   console.log("保存成功");
// } else {
//   console.log("保存失败");
// }
const db = {
  file: "./json/hero.json",
  // 1.查询所有数据
  get() {
    const data = getFileData(this.file);
    return data;
  },
  //2.查询一条数据
  search(id) {
    return getFileData(this.file).find(item => item.id == id);
  },
  // 3.增加一条数据
  add({ name, skill, icon }) {
    // console.log(name, skill, icon);
    //读取文件
    const data = getFileData(this.file);
    //追加文件
    data.push({
      id: data[data.length - 1].id + 1,
      name,
      skill,
      icon
    });
    //写入文件
    return saveFileData(data);
  },
  //4.删除一条数据
  delete(id) {
    //读取文件
    const data = getFileData(this.file);
    //根据文件的索引值，找到对应的id,删除
    const index = data.findIndex(item => item.id == id);

    //找不到索引值为-1
    if (index !== -1) {
      data.splice(index, 1);
      //写入文件
      saveFileData(data);
      return true;
    } else {
      return false;
    }
  },
  //5.修改一条数据
  edit({ id, name, skill, icon }) {
    //读入文件
    const data = getFileData(this.file);
    //把找到的对象的内存地址赋值给dataFind
    const dataFind = data.find(item => item.id == id);
    if (dataFind) {
      dataFind.name = name;
      dataFind.skill = skill;
      dataFind.icon = icon;
      //写入文件
      saveFileData(data);
      return true;
    } else {
      return false;
    }
  }
};
//测试查询接口的封装
// 1.查询所有数据
// const data1 = db.get();
// console.log("查询接口", data1);
//2.查询一条数据
// const data2 = db.search(5);
// if (data2) {
// console.log("查询一条", data2);
// } else {
// console.log("查无此人");
// }
// 3.增加一条数据
//(传过去是一个对象)
// const data3 = db.add({
//   name: "火星",
//   skill: "听歌",
//   icon: "sssss"
// });
// if (data3) {
//   console.log("添加成功");
// } else {
//   console.log("添加失败");
// }
//4.删除一条数据
// const data4 = db.delete(100);
// if (data4) {
//   console.log("删除成功");
// } else {
//   console.log("删除失败");
// }
//5.修改一条数据
// const data5 = db.edit({
//   id: 100,
//   name: "小花花",
//   skill: "音乐",
//   icon: "ddfddd"
// });
// if (data5) {
//   console.log("修改成功");
// } else {
//   console.log("修改失败");
// }
// ----------下面是接口-----------------------------------------------------

//服务器在3000 端口启动
//启动3000端口
app.listen(3000, () => {
  console.log("服务器已启动：http://127.0.0.1:3000");
});
//get 方式打开的首页
app.get("/", (req, res) => {
  res.send("<h1>英雄联盟的接口</h1>");
});
//post 方式打开的首页
app.post("/", (req, res) => {
  res.send("<h1>Post方式打开的首页</h1>");
});
app.post("/login", (req, res) => {
  //从req.body 对象中解构出username和password
  const { username, password } = req.body;
  //调用封装好的函数，获取文件信息，内部返回《数组》格式，保存到data 常量中
  const data = getFileData("./json/user.json");
  //调用数组find方法，获取数组中某个用户名的信息
  const user = data.find(item => item.username === username);
  //如果能获取到信息，验证用户名和密码
  if (user) {
    //判断用户输入的用户名密码是否都和本地的用户名密码相同
    if (username === user.username && password === user.password) {
      //如果完全相同，返回登录成功
      res.send({
        code: 200,
        msg: "登录成功"
      });
    }
    //如果不相同，提示错误
    else {
      res.send({
        code: 400,
        msg: "用户名或密码错误"
      });
    }
  }
  //如果通过find 方法找不到用户就执行 else逻辑
  else {
    //没有用户提示用户名不存在
    res.send({
      code: 400,
      msg: "用户不存在"
    });
  }
});
// 英雄列表
app.get("/list", (req, res) => {
  const data = db.get();
  if (data) {
    res.send({
      code: 200,
      msg: "获取成功",
      data
    });
  } else {
    res.send({
      code: 400,
      msg: "获取失败"
    });
  }
});
//英雄查询
app.get("/search", (req, res) => {
  const { id } = req.query; //解构
  const data = db.search(id);
  if (data) {
    res.send({
      code: 200,
      msg: "获取成功",
      data
    });
  } else {
    res.send({
      code: 400,
      msg: "获取失败"
    });
  }
});

// 英雄新增
//1.需要使用multer实现图片上传，注意图片属性为icon,记得在上面的multer改
//2.如何获取到上传图片后再服务器的图片名称
// 3.还要把图片名称自己拼接完成
app.post("/add", upload, (req, res) => {
  const { name, skill } = req.body;
  const { filename } = req.file;
  const data = db.add({
    name,
    skill,
    icon: path.join("/public/uploads", filename)
  });
  if (data) {
    res.send({
      code: 200,
      msg: "新增成功",
      data
    });
  } else {
    res.send({
      code: 400,
      msg: "参数错误"
    });
  }
});
//英雄删除
app.get("/delete", (req, res) => {
  const { id } = req.query;
  const bl = db.delete(id);
  bl
    ? res.send({ code: 200, msg: "删除成功" })
    : res.send({ code: 400, msg: "删除失败" });
});
//英雄编辑
app.post("/edit", upload, (req, res) => {
  console.log(req);
  console.log(res);
  const { id, name, skill } = req.body;
  const { filename } = req.file;
  const bl = db.edit({
    id,
    name,
    skill,
    icon: path.join("/public/uploads", filename)
  });
  bl
    ? res.send({ code: 200, msg: "修改成功" })
    : res.send({ code: 400, msg: "修改失败" });
});
