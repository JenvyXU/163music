import EventHub from 'js/event-hub.js'
import AV from 'leancloud-storage'
import 'js/av.js' //初始AV
let view = {
  el: ".page>main>.songMessage",
  init() {
    this.$el = $(this.el);
  },
  template: `
            <form class="form">
                <div class="row">
                    <label>歌名</label>
                     <input name="name" type="text" value="__name__">
                </div>
                <div class="row">
                    <label>歌手</label>
                    <input name="singer" type="text" value="__singer__">
                </div>
                <div class="row">
                    <label>外链</label>
                    <input name="url" type="text" value="__url__">
                </div>
                <div class="row">
                    <label>封面</label>
                    <input name="cover" type="text" value="__cover__">
                </div>
                <div class="row">
                    <label class="lyric">歌词</label>
                    <textarea name="lyrics" rows="20" cols="50">__lyrics__</textarea>
                </div>
                <div class="row actions">
                    <button type="submit">保存</button>
                </div>
            </form>
            <p class="message"></p>
            `,
  render(data = {}) {
    //ES6语法，如果data为空或者undefined,那么data就是空对象
    let placeholders = ["name", "url", "singer", "id", "cover", "lyrics"];
    let html = this.template;
    placeholders.map(string => {
      html = html.replace(`__${string}__`, data[string] || "");
    });
    this.$el.html(html);
    if (data.cover) {
      this.$el.prepend(
        `<img class="cover" src="${data.cover}" style="display:block">`
      );
    }
    if (data.id) {
      this.$el.prepend("<h3>编辑歌曲</h3>");
    } else {
      this.$el.prepend("<h3>新建歌曲</h3>");
    }
  },
  reset() {
    this.render({});
  }
};
let model = {
  data: {
    name: "",
    singer: "",
    url: "",
    id: "",
    cover: "",
    lyrics: ""
  },
  create(data) {
    var Song = AV.Object.extend("Song");
    var song = new Song();
    song.set("name", data.name);
    song.set("singer", data.singer);
    song.set("lyrics", data.lyrics);
    song.set("url", data.url);
    song.set("cover", data.cover);
    return song.save().then(
      newSong => {
        let { id, attributes } = newSong;
        // this.data.id=id
        // this.data.name=attributes.name
        // this.data.singer=attributes.url
        Object.assign(this.data, {
          id: id,
          //...attributes,
          name: attributes.name,
          singer: attributes.singer,
          lyrics: attributes.lyrics,
          url: attributes.url,
          cover: attributes.cover
        });
      },
      error => {
        console.error(error);
      }
    );
  },
  update(data) {
    var song = AV.Object.createWithoutData("Song", this.data.id);
    song.set("name", data.name);
    song.set("singer", data.singer);
    song.set("lyrics", data.lyrics);
    song.set("url", data.url);
    song.set("cover", data.cover);
    return song.save().then(response => {
      Object.assign(this.data, data);
      return response;
    });
  }
};
let controller = {
  init(view, model) {
    this.view = view;
    this.view.init();
    this.model = model;
    this.view.render(this.model.data);
    this.bindEvents();
    EventHub.on("select", data => {
      this.model.data = data;
      this.view.render(this.model.data);
    });
    EventHub.on("new", data => {
      if (this.model.data.id) {
        this.model.data = {
          name: "",
          url: "",
          singer: "",
          id: "",
          lyrics: ""
        };
      } else {
        Object.assign(this.model.data, data);
      }

      this.view.render(this.model.data);
    });
  },
  create() {
    let needs = "name singer url cover lyrics".split(" ");
    let data = {};
    needs.map(string => {
      data[string] = this.view.$el.find(`[name="${string}"]`).val();
    });
    this.model.create(data).then(() => {
      this.view.reset();
      let string = JSON.stringify(this.model.data);
      let object = JSON.parse(string);
      EventHub.emit("create", object);
      $(this.view.el)
        .find(".message")
        .text("保存成功")
        .fadeIn(500)
        .fadeOut(500);
    });
  },
  update() {
    let needs = "name singer url cover lyrics".split(" ");
    let data = {};
    needs.map(string => {
      data[string] = this.view.$el.find(`[name="${string}"]`).val();
    });
    this.model.update(data).then(() => {
      EventHub.emit(
        "update",
        JSON.parse(JSON.stringify(this.model.data))
      );
      $(this.view.el)
        .find(".message")
        .text("更新成功")
        .fadeIn(500)
        .fadeOut(500);
    });
  },
  bindEvents() {
    //事件委托
    this.view.$el.on("submit", "form", e => {
      e.preventDefault();
      let songData = [];
      for (let i = 0; i < 4; i++) {
        songData.push(
          $(this.view.el)
            .find("input")
            .eq(i)
            .val()
        );
      }
      songData.push(
        $(this.view.el)
          .find("textarea")
          .val()
      );
      let isReady = songData.every(item => {
        return item;
      });
      if (!isReady) return; //判断歌曲信息是否已经填写完成

      if (this.model.data.id) {
        this.update();
      } else {
        this.create();
      }
    });
    EventHub.on("setCoverUrl", url => {
      this.view.$el.find('input[name="cover"]').val(url);
      this.view.$el.prepend(`<img class="cover" src="${url}">`);
    });
    EventHub.on("setSongUrl", url => {
      this.view.$el.find('input[name="url"]').val(url);
    });
    EventHub.on("editMode", () => {
      this.view.$el.find("textarea").css({ height: "235px" });
    });
  }
};
//controller.init(view, model);
export default{ view, model, controller };
