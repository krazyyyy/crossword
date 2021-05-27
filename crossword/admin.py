import json
from xml.etree import ElementTree
from django.contrib import admin
from django.db.models import CharField
from django.forms import TextInput, FileField, ModelForm
from crossword.models import Puzzle, Entry, Subscriber, Blank, Block

XMLNS = '{http://crossword.info/xml/rectangular-puzzle}'

def send_notification(modeladmin, request, queryset):
    for post in queryset:
        post.send(request)

send_notification.short_description = "Send selected Post(s) to all subscribers"



def import_from_xml(xml, puzzle):
    """Load a puzzle from Crossword Compiler XML format into the database."""
    # pylint: disable=no-member
    # false +ve on xml.etree.ElementTree.Element (v1.64)
    crossword = ElementTree.parse(xml).find('*/%scrossword' % XMLNS)
    for word in crossword.iter('%sword' % XMLNS):
        xraw = word.attrib['x'].split('-')
        yraw = word.attrib['y'].split('-')
        xstart = int(xraw[0])
        ystart = int(yraw[0])
        down = len(yraw) > 1
        clue = crossword.find('*/%sclue[@word="%s"]' % (XMLNS, word.attrib['id'])).text
        if 'solution' in word.attrib:
            answer = word.attrib['solution']
        else:
            answer = ''
            if down:
                for y in range(ystart, int(yraw[1]) + 1):
                    answer += crossword.find('*/%scell[@x="%d"][@y="%d"]' %
                                             (XMLNS, xstart, y)).attrib['solution'].lower()
            else:
                for x in range(xstart, int(xraw[1]) + 1):
                    answer += crossword.find('*/%scell[@x="%d"][@y="%d"]' %
                                             (XMLNS, x, ystart)).attrib['solution'].lower()

        # XML is 1-based, model is 0-based
        xstart -= 1
        ystart -= 1
        entry = Entry(puzzle=puzzle, clue=clue, answer=answer, x=xstart, y=ystart, down=down)
        entry.save()


def clues_generator(data, start, cell, d, y, typ):
    for clue in data['clues'][typ]:
        if clue['number'] == cell:
            
            pos = clue['number']
            clue_ = clue['clue']
            enum = clue['enumeration']
            # posi = clue['clues']
            try:
                
                if len(enum.split(',')) > 1:
                    
                    enum_ = enum.split(',')
                else:
                    
                    enum_ = enum.split('-')
                for i in range(0, len(enum_)):
                    enum_[i] = int(enum_[i])
                
                enum = sum(enum_)
                
            except:
                enum = int(enum)
            word = ''
            if typ == 'Across':
                down = False
                endx = int(enum) + int(start)
                for t in range(start, endx):
                    # print(d[y][t])
                    word += str(d[y][t])
            else:
                down = True
                endy = int(enum) + int(start)
                for t in range(start, endy):
                    # print(d[t][y])
                    word += str(d[t][y])
            return word, down, pos, clue_


def import_puzzle_from_ipuz(ipuz, puzzle):
    """Load a blank grid from an ipuz file into the database."""
    data = json.loads(ipuz.read().decode('latin_1'))
    # print(data['puzzle'])
    # print(data['clues'])
    d = data['solution']
    # print(d)
    for y, row in enumerate(data['puzzle']):
        for x, cell in enumerate(row):
                # print(cell, row)
            # print(d[x][y])
            cluecont = 0
            dw = False
            ac = False
            for clue in data['clues']['Across']:
                if clue['number'] == cell:
                    cluecont =+ 1
                    ac = True
            for clue in data['clues']['Down']:
                if clue['number'] == cell:
                    cluecont =+ 1
                    dw = True
            # print(dw, "Down")        
            # print(ac, "Across")        
            # print(cluecont)
            # if cluecont == 2:
            # for z in range(cluecont):
                # print(z)
            if cell != "#" and cell != 0:
                
                startx, starty = x , y
                number = cell
                if ac == True:
                    puzz = clues_generator(data, startx, cell, d,y, 'Across')
                    entry = Entry(puzzle=puzzle, number=puzz[2], clue=puzz[3], answer=puzz[0], x=x, y=y, down=puzz[1])        
                    print(puzz)
                    entry.save()
                if dw == True: 
                    puzz = clues_generator(data, starty, cell, d,x, 'Down')
                # print(clues_generator(data, startx, cell, d,y))
                    entry = Entry(puzzle=puzzle, number=puzz[2], clue=puzz[3], answer=puzz[0], x=x, y=y, down=puzz[1])        
                    print(puzz)
                    entry.save()
                # print(puzz)
                # print(type(puzz))
                     
                # print(entry)
                # entry = Entry(puzzle=puzzle, number=puzz[2], clue=puzz[3], answer=puzz[0], x=x, y=y, down=puzz[1])        
                # entry.save()
    # raise EOFError   

def import_blank_from_ipuz(ipuz, blank):
    """Load a blank grid from an ipuz file into the database."""
    data = json.loads(ipuz.read().decode('latin_1'))
    for y, row in enumerate(data['puzzle']):
        for x, cell in enumerate(row):
            if cell == "#":
                block = Block(blank=blank, x=x, y=y)
                block.save()


class PuzzleImportForm(ModelForm):
    """Add an XML import field."""
    file_import = FileField(label='Import from Ipuz', required=False)
    class Meta:
        model = Puzzle
        fields = ['number', 'user','name', 'pub_date', 'comments']

class EntryInline(admin.StackedInline):
    """Increase the length of the text field for puzzle clues."""
    model = Entry
    formfield_overrides = {CharField: {'widget': TextInput(attrs={'size':'100'})}}


class PuzzleAdmin(admin.ModelAdmin):
    """Show entries inline and allow import from XML"""
    form = PuzzleImportForm
    inlines = [EntryInline]
    actions = [send_notification]

    def save_model(self, request, obj, form, change):
        super(PuzzleAdmin, self).save_model(request, obj, form, change)
        ipuz_file = form.cleaned_data.get('file_import', None)
        if ipuz_file:
            import_puzzle_from_ipuz(ipuz_file, obj)




class BlankImportForm(ModelForm):
    """Add an ipuz import field."""
    file_import = FileField(label='Import from ipuz', required=False)
    class Meta:
        model = Blank
        fields = ['display_order']

class BlockInline(admin.TabularInline):
    """Show blocks in a table."""
    model = Block

class BlankAdmin(admin.ModelAdmin):
    """Show blocks inline and allow import from ipuz."""
    form = BlankImportForm
    inlines = [BlockInline]
    save_as = True

    def save_model(self, request, obj, form, change):
        super(BlankAdmin, self).save_model(request, obj, form, change)
        ipuz_file = form.cleaned_data.get('file_import', None)
        if ipuz_file:
            import_blank_from_ipuz(ipuz_file, obj)


admin.site.site_header = "Administration"
admin.site.site_title = "Admin Pannel"
admin.site.register(Puzzle, PuzzleAdmin)
admin.site.register(Blank, BlankAdmin)
admin.site.register(Subscriber)
admin.site.register(Entry)
